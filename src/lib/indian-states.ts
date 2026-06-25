export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
] as const;

/** ISO 3166-2:IN codes without country prefix (SabPaisa expects e.g. "TN", not "Tamil Nadu"). */
export const INDIAN_STATE_CODE_BY_NAME: Record<(typeof INDIAN_STATES)[number], string> = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  Assam: "AS",
  Bihar: "BR",
  Chhattisgarh: "CT",
  Goa: "GA",
  Gujarat: "GJ",
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "MN",
  Meghalaya: "ML",
  Mizoram: "MZ",
  Nagaland: "NL",
  Odisha: "OR",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "SK",
  "Tamil Nadu": "TN",
  Telangana: "TG",
  Tripura: "TR",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UT",
  "West Bengal": "WB",
  Delhi: "DL",
  "Jammu and Kashmir": "JK",
  Ladakh: "LA",
  Chandigarh: "CH",
  Puducherry: "PY",
};

const VALID_STATE_CODES = new Set(Object.values(INDIAN_STATE_CODE_BY_NAME));

export function toIndianStateCode(state: string): string {
  const trimmed = state.trim();
  const upper = trimmed.toUpperCase();

  if (/^[A-Z]{2}$/.test(upper) && VALID_STATE_CODES.has(upper)) {
    return upper;
  }

  const fromName = INDIAN_STATE_CODE_BY_NAME[trimmed as (typeof INDIAN_STATES)[number]];
  if (fromName) return fromName;

  throw new Error(`Invalid Indian state for payment: ${state}`);
}
