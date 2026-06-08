import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp, isValidIndianPhone, normalizePhone } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body.phone === "string" ? body.phone : "";

    if (!isValidIndianPhone(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 },
      );
    }

    const normalized = normalizePhone(phone);
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpSession.deleteMany({ where: { phone: normalized } });
    await prisma.otpSession.create({
      data: { phone: normalized, code, expiresAt },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV OTP] ${normalized}: ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      ...(process.env.NODE_ENV === "development" ? { devOtp: code } : {}),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    const message =
      process.env.NODE_ENV === "development"
        ? "Database unavailable. Run: npm run db:push"
        : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
