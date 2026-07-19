export type DonationServiceErrorCode =
  | "VALIDATION_ERROR"
  | "CAMPAIGN_NOT_FOUND"
  | "CAMPAIGN_NOT_ACTIVE"
  | "ACTIVE_CAMPAIGN_EXISTS"
  | "DONATION_NOT_FOUND"
  | "DONATION_NOT_PENDING"
  | "DONATION_INVALID_STATE"
  | "DONATION_STATE_CONFLICT"
  | "DONATION_ALREADY_APPROVED"
  | "DONATION_ALREADY_REJECTED"
  | "UPLOAD_VALIDATION_ERROR"
  | "UPLOAD_ERROR";

export class DonationServiceError extends Error {
  code: DonationServiceErrorCode;
  status: number;
  details?: Record<string, string>;

  constructor({
    code,
    message,
    status,
    details,
  }: {
    code: DonationServiceErrorCode;
    message: string;
    status: number;
    details?: Record<string, string>;
  }) {
    super(message);
    this.name = "DonationServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function createValidationError(details: Record<string, string>) {
  return new DonationServiceError({
    code: "VALIDATION_ERROR",
    message: "Datos invalidos",
    status: 400,
    details,
  });
}

