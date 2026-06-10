import { NextRequest, NextResponse } from "next/server";
import { generateOtp, isDevOtpEnabled, isValidIndianPhone, normalizePhone } from "@/lib/otp";
import { isOtpProviderConfigured, sendOtpSms } from "@/lib/otp-provider";
import { prisma } from "@/lib/prisma";

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
    const devMode = isDevOtpEnabled();

    if (!devMode && !isOtpProviderConfigured()) {
      return NextResponse.json(
        { error: "OTP SMS provider is not configured" },
        { status: 503 },
      );
    }

    if (!devMode) {
      const clientIp =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip")?.trim() ||
        undefined;
      await sendOtpSms(normalized, code, { clientIp });
    } else {
      console.log(`[DEV OTP] ${normalized}: ${code}`);
    }

    await prisma.otpSession.deleteMany({ where: { phone: normalized } });
    await prisma.otpSession.create({
      data: { phone: normalized, code, expiresAt },
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      ...(devMode ? { devOtp: code } : {}),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    const detail = error instanceof Error ? error.message : "Failed to send OTP";
    const message =
      process.env.NODE_ENV === "development" && detail.includes("Prisma")
        ? "Database unavailable. Run: npm run db:push"
        : detail;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
