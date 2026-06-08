import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isValidIndianPhone, normalizePhone } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : existing.fullName;
    const phone = typeof body.phone === "string" ? body.phone : existing.phone;
    const line1 = typeof body.line1 === "string" ? body.line1.trim() : existing.line1;
    const line2 = typeof body.line2 === "string" ? body.line2.trim() : existing.line2;
    const city = typeof body.city === "string" ? body.city.trim() : existing.city;
    const state = typeof body.state === "string" ? body.state.trim() : existing.state;
    const pinCode = typeof body.pinCode === "string" ? body.pinCode.trim() : existing.pinCode;
    const isDefault = typeof body.isDefault === "boolean" ? body.isDefault : existing.isDefault;

    if (!isValidIndianPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(pinCode)) {
      return NextResponse.json({ error: "Pin code must be 6 digits" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        fullName,
        phone: normalizePhone(phone),
        line1,
        line2,
        city,
        state,
        pinCode,
        isDefault,
      },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Address PATCH error:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
