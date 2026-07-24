import { validateMoneyAmount } from "./money";
import { validateOptionalYouTubeUrl } from "./youtubeVideo";

const MAX_INSTITUTION_NAME_LENGTH = 120;
const MAX_LOCALITY_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 180;

export type DonationCampaignPayloadInput = {
  institutionName?: unknown;
  locality?: unknown;
  address?: unknown;
  placeImageUrl?: unknown;
  placeImagePublicId?: unknown;
  youtubeVideoUrl?: unknown;
  invoiceImageUrl?: unknown;
  invoiceImagePublicId?: unknown;
  invoiceImageResourceType?: unknown;
  invoiceImageOriginalName?: unknown;
  invoiceImageBytes?: unknown;
  goalAmount?: unknown;
};

export type ValidDonationCampaignPayload = {
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  placeImagePublicId: string;
  youtubeVideoUrl: string | null;
  invoiceImageUrl?: string | null;
  invoiceImagePublicId?: string | null;
  invoiceImageResourceType?: string | null;
  invoiceImageOriginalName?: string | null;
  invoiceImageBytes?: number | null;
  goalAmount: string;
};

export type DonationCampaignPayloadValidationResult =
  | { success: true; data: ValidDonationCampaignPayload }
  | { success: false; errors: Record<string, string> };

function getTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalTrimmedString(value: unknown): string | null {
  const trimmedValue = getTrimmedString(value);
  return trimmedValue || null;
}

function getOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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
  const youtubeVideoUrl = validateOptionalYouTubeUrl(input.youtubeVideoUrl);
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
  if (!youtubeVideoUrl.success) {
    errors.youtubeVideoUrl = youtubeVideoUrl.error;
  }

  if (
    Object.keys(errors).length > 0 ||
    !goalAmount.success ||
    !youtubeVideoUrl.success
  ) {
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
      youtubeVideoUrl: youtubeVideoUrl.data,
      ...("invoiceImageUrl" in input && {
        invoiceImageUrl: getOptionalTrimmedString(input.invoiceImageUrl),
      }),
      ...("invoiceImagePublicId" in input && {
        invoiceImagePublicId: getOptionalTrimmedString(input.invoiceImagePublicId),
      }),
      ...("invoiceImageResourceType" in input && {
        invoiceImageResourceType: getOptionalTrimmedString(
          input.invoiceImageResourceType,
        ),
      }),
      ...("invoiceImageOriginalName" in input && {
        invoiceImageOriginalName: getOptionalTrimmedString(
          input.invoiceImageOriginalName,
        ),
      }),
      ...("invoiceImageBytes" in input && {
        invoiceImageBytes: getOptionalNumber(input.invoiceImageBytes),
      }),
      goalAmount: goalAmount.data.amount,
    },
  };
}
