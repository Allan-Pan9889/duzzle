const DEV_OTP = "123456";

export function generateOtp(): string {
  if (process.env.NODE_ENV === "development") return DEV_OTP;
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `+91${digits}`;
}
