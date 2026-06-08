import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { isValidIndianPhone, normalizePhone } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body.phone === "string" ? body.phone : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!isValidIndianPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    const normalized = normalizePhone(phone);

    const session = await prisma.otpSession.findFirst({
      where: {
        phone: normalized,
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { phone: normalized },
      update: {},
      create: { phone: normalized },
    });

    await prisma.otpSession.update({
      where: { id: session.id },
      data: { verified: true },
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, phone: user.phone, name: user.name },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
