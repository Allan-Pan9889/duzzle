import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isValidIndianPhone, normalizePhone } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

function validateAddress(body: Record<string, unknown>) {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const line1 = typeof body.line1 === "string" ? body.line1.trim() : "";
  const line2 = typeof body.line2 === "string" ? body.line2.trim() : undefined;
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const state = typeof body.state === "string" ? body.state.trim() : "";
  const pinCode = typeof body.pinCode === "string" ? body.pinCode.trim() : "";
  const isDefault = Boolean(body.isDefault);

  if (!fullName || !line1 || !city || !state) {
    return { error: "Please fill in all required fields" };
  }

  if (!isValidIndianPhone(phone)) {
    return { error: "Invalid phone number" };
  }

  if (!/^\d{6}$/.test(pinCode)) {
    return { error: "Pin code must be 6 digits" };
  }

  return {
    data: {
      fullName,
      phone: normalizePhone(phone),
      line1,
      line2: line2 || null,
      city,
      state,
      pinCode,
      isDefault,
    },
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = validateAddress(body);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { userId: user.id, ...result.data },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Addresses POST error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
