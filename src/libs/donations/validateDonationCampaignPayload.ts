import { validateMoneyAmount } from "./money";

const MAX_INSTITUTION_NAME_LENGTH = 120;
const MAX_LOCALITY_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 180;

export type DonationCampaignPayloadInput = {
  institutionName?: unknown;
  locality?: unknown;
  address?: unknown;
  placeImageUrl?: unknown;
  placeImagePublicId?: unknown;
  goalAmount?: unknown;
};

export type ValidDonationCampaignPayload = {
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  placeImagePublicId: string;
  goalAmount: string;
};

export type DonationCampaignPayloadValidationResult =
  | { success: true; data: ValidDonationCampaignPayload }
  | { success: false; errors: Record<string, string> };

function getTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateRequiredString(
  errors: Record<string, string>,
  field: string,
  value: string,
  label: string,
  maxLength: number,
) {
  if (!value) {
    errors[field] = `${label} es obligatorio`;
  } else if (value.length > maxLength) {
    errors[field] = `${label} no puede superar ${maxLength} caracteres`;
  }
}

export function validateDonationCampaignPayload(
  input: DonationCampaignPayloadInput,
): DonationCampaignPayloadValidationResult {
  const institutionName = getTrimmedString(input.institutionName);
  const locality = getTrimmedString(input.locality);
  const address = getTrimmedString(input.address);
  const placeImageUrl = getTrimmedString(input.placeImageUrl);
  const placeImagePublicId = getTrimmedString(input.placeImagePublicId);
  const goalAmount = validateMoneyAmount(input.goalAmount);
  const errors: Record<string, string> = {};

  validateRequiredString(
    errors,
    "institutionName",
    institutionName,
    "El nombre de la institucion",
    MAX_INSTITUTION_NAME_LENGTH,
  );
  validateRequiredString(
    errors,
    "locality",
    locality,
    "La localidad",
    MAX_LOCALITY_LENGTH,
  );
  validateRequiredString(
    errors,
    "address",
    address,
    "La direccion",
    MAX_ADDRESS_LENGTH,
  );
  if (!placeImageUrl) errors.placeImageUrl = "La imagen del lugar es obligatoria";
  if (!placeImagePublicId) {
    errors.placeImagePublicId = "El identificador de la imagen es obligatorio";
  }
  if (!goalAmount.success) {
    errors.goalAmount = goalAmount.error;
  }

  if (Object.keys(errors).length > 0 || !goalAmount.success) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      institutionName,
      locality,
      address,
      placeImageUrl,
      placeImagePublicId,
      goalAmount: goalAmount.data.amount,
    },
  };
}
