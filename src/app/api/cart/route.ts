import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        variant: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.variant.product.price * item.quantity,
      0,
    );

    return NextResponse.json({ items, subtotal });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const variantId = typeof body.variantId === "string" ? body.variantId : "";
    const quantity = Math.max(1, parseInt(String(body.quantity || 1), 10));

    if (!variantId) {
      return NextResponse.json({ error: "variantId is required" }, { status: 400 });
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_variantId: { userId: user.id, variantId } },
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if (variant.stock < newQuantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const item = await prisma.cartItem.upsert({
      where: {
        userId_variantId: { userId: user.id, variantId },
      },
      update: {
        quantity: newQuantity,
      },
      create: {
        userId: user.id,
        variantId,
        quantity,
      },
      include: {
        variant: {
          include: {
            product: {
              select: { name: true, slug: true, price: true, images: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
