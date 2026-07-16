const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

export type DonationVisibility = "public" | "anonymous";

export type DonationPayloadInput = {
  campaignId?: unknown;
  visibility?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
};

export type ValidDonationPayload = {
  campaignId: number;
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type DonationPayloadValidationResult =
  | { success: true; data: ValidDonationPayload }
  | { success: false; errors: Record<string, string> };

function getTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getCampaignId(value: unknown): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isInteger(numericValue) || numericValue <= 0) return null;

  return numericValue;
}

function normalizeVisibility(value: unknown): DonationVisibility | null {
  if (value === "public" || value === "anonymous") return value;

  return null;
}

export function validateDonationPayload(
  input: DonationPayloadInput,
): DonationPayloadValidationResult {
  const campaignId = getCampaignId(input.campaignId);
  const visibility = normalizeVisibility(input.visibility);
  const firstName = getTrimmedString(input.firstName);
  const lastName = getTrimmedString(input.lastName);
  const email = getTrimmedString(input.email).toLowerCase();
  const errors: Record<string, string> = {};

  if (!campaignId) errors.campaignId = "La campana es obligatoria";
  if (!visibility) errors.visibility = "La visibilidad de la donacion no es valida";

  if (visibility === "public") {
    if (!firstName) errors.firstName = "El nombre es obligatorio";
    if (!lastName) errors.lastName = "El apellido es obligatorio";
  }

  if (firstName && firstName.length > MAX_NAME_LENGTH) {
    errors.firstName = `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres`;
  }
  if (lastName && lastName.length > MAX_NAME_LENGTH) {
    errors.lastName = `El apellido no puede superar ${MAX_NAME_LENGTH} caracteres`;
  }
  if (email) {
    if (email.length > MAX_EMAIL_LENGTH) {
      errors.email = `El email no puede superar ${MAX_EMAIL_LENGTH} caracteres`;
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "El email no es valido";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const isAnonymous = visibility === "anonymous";

  return {
    success: true,
    data: {
      campaignId: campaignId as number,
      isAnonymous,
      firstName: isAnonymous ? null : firstName,
      lastName: isAnonymous ? null : lastName,
      email: email || null,
    },
  };
}
