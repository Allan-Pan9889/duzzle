import { PaymentMethod } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { calcShipping, getShippingSettings } from "@/lib/shipping";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const addressId = typeof body.addressId === "string" ? body.addressId : "";
    const paymentMethod = body.paymentMethod as PaymentMethod;

    if (!addressId) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!["RAZORPAY", "COD"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (paymentMethod === "RAZORPAY" && !isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Online payment is not configured. Please use Cash on Delivery." },
        { status: 400 },
      );
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    for (const item of cartItems) {
      if (item.variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.variant.product.name}` },
          { status: 400 },
        );
      }
    }

    const { freeShippingThreshold, baseShippingFee } = await getShippingSettings();
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.variant.product.price * item.quantity,
      0,
    );
    const shippingFee = calcShipping(subtotal, freeShippingThreshold, baseShippingFee);
    const total = subtotal + shippingFee;
    const orderNumber = await generateOrderNumber();

    const addressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pinCode: address.pinCode,
    };

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          paymentMethod,
          subtotal,
          shippingFee,
          total,
          addressSnapshot,
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              variantId: item.variantId,
              productName: item.variant.product.name,
              size: item.variant.size,
              color: item.variant.color,
              price: item.variant.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return created;
    });

    let razorpayOrderId: string | null = null;

    if (paymentMethod === "RAZORPAY") {
      const razorpay = getRazorpayClient();
      const razorpayOrder = await razorpay.orders.create({
        amount: total * 100,
        currency: "INR",
        receipt: orderNumber,
      });
      razorpayOrderId = razorpayOrder.id;

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId },
      });
    }

    return NextResponse.json({
      order: { ...order, razorpayOrderId },
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
