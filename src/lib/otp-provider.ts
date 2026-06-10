import { createHash } from "crypto";

const DEFAULT_SEND_URL = "http://sms-api.minibe.net/sms/send";

type OtpProviderConfig = {
  apiKey: string;
  apiSecret: string;
  appId: string;
  sendUrl: string;
};

type SendOtpSmsResult = {
  msgId: string;
  mobile: string;
};

type MinibeSendResponse = {
  code?: string | number;
  message?: string;
  data?: {
    msgId?: string;
    mobile?: string;
  };
};

export function isOtpProviderConfigured(): boolean {
  return Boolean(
    process.env.OTP_API_KEY?.trim() &&
      process.env.OTP_API_SECRET?.trim() &&
      process.env.OTP_APP_ID?.trim(),
  );
}

function getOtpProviderConfig(): OtpProviderConfig {
  const apiKey = process.env.OTP_API_KEY?.trim();
  const apiSecret = process.env.OTP_API_SECRET?.trim();
  const appId = process.env.OTP_APP_ID?.trim();

  if (!apiKey || !apiSecret || !appId) {
    throw new Error("OTP provider is not configured");
  }

  const sendUrl =
    process.env.OTP_API_URL?.trim() ||
    (process.env.OTP_API_BASE_URL?.trim()
      ? `${process.env.OTP_API_BASE_URL.trim().replace(/\/$/, "")}/send`
      : DEFAULT_SEND_URL);

  return { apiKey, apiSecret, appId, sendUrl };
}

export function buildOtpSign(
  apiKey: string,
  apiSecret: string,
  timeStamp: string,
): string {
  return createHash("md5")
    .update(`${apiKey}${apiSecret}${timeStamp}`)
    .digest("hex");
}

/** +918386325478 → 8386325478 (minibe expects 10-digit mobile, no country code) */
export function toOtpApiMobile(normalizedPhone: string): string {
  const mobile = normalizedPhone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new Error("Invalid phone format for OTP API");
  }
  return mobile;
}

export async function sendOtpSms(
  normalizedPhone: string,
  code: string,
  options?: { clientIp?: string },
): Promise<SendOtpSmsResult> {
  const config = getOtpProviderConfig();
  const timeStamp = String(Math.floor(Date.now() / 1000));
  const sign = buildOtpSign(config.apiKey, config.apiSecret, timeStamp);
  const mobile = toOtpApiMobile(normalizedPhone);

  const body: Record<string, string> = {
    app_id: config.appId,
    mobile,
    otp: code,
  };
  if (options?.clientIp?.trim()) {
    body.ip = options.clientIp.trim();
  }

  const res = await fetch(config.sendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      sign,
      timeStamp,
      apiKey: config.apiKey,
    },
    body: JSON.stringify(body),
  });

  let data: MinibeSendResponse;
  const raw = await res.text();
  try {
    data = JSON.parse(raw) as MinibeSendResponse;
  } catch {
    throw new Error(
      `OTP provider returned invalid JSON (HTTP ${res.status}): ${raw.slice(0, 200)}`,
    );
  }

  if (!res.ok) {
    throw new Error(data.message || `OTP provider HTTP ${res.status}`);
  }

  if (String(data.code) !== "200") {
    throw new Error(data.message || `OTP provider error (code ${data.code})`);
  }

  return {
    msgId: data.data?.msgId ?? "",
    mobile: data.data?.mobile ?? mobile,
  };
}
