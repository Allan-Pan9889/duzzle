import { isOtpProviderConfigured } from "@/lib/otp-provider";

const DEFAULT_DEV_OTP = "123456";

/** Fixed OTP when OTP_DEV_CODE is set, or local dev without SMS provider. */
export function getDevOtpCode(): string | null {
  const fromEnv = process.env.OTP_DEV_CODE?.trim();
  if (fromEnv && /^\d{6}$/.test(fromEnv)) return fromEnv;
  if (process.env.NODE_ENV === "development" && !isOtpProviderConfigured()) {
    return DEFAULT_DEV_OTP;
  }
  return null;
}

export function isDevOtpEnabled(): boolean {
  return getDevOtpCode() !== null;
}

export function generateOtp(): string {
  const devOtp = getDevOtpCode();
  if (devOtp) return devOtp;
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `+91${digits}`;
}
