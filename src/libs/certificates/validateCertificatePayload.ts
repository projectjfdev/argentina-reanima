import { normalizeCertificateEmail } from "./normalizeCertificateEmail";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CertificatePayloadInput = {
  recipientName?: unknown;
  recipientEmail?: unknown;
  recipientDni?: unknown;
  certificateText?: unknown;
  footerText?: unknown;
  serialNumber?: unknown;
};

export type ValidCertificatePayload = {
  recipientName: string;
  recipientEmail: string;
  recipientEmailNormalized: string;
  recipientDni: string;
  certificateText: string;
  footerText: string;
  serialNumber: string;
};

export type CertificatePayloadValidationResult =
  | { success: true; data: ValidCertificatePayload }
  | { success: false; errors: Record<string, string> };

function getTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCertificatePayload(
  input: CertificatePayloadInput,
): CertificatePayloadValidationResult {
  const recipientName = getTrimmedString(input.recipientName);
  const recipientEmail = getTrimmedString(input.recipientEmail);
  const recipientEmailNormalized = normalizeCertificateEmail(recipientEmail);
  const recipientDni = getTrimmedString(input.recipientDni);
  const certificateText = getTrimmedString(input.certificateText);
  const footerText = getTrimmedString(input.footerText);
  const serialNumber = getTrimmedString(input.serialNumber);

  const errors: Record<string, string> = {};

  if (!recipientName) errors.recipientName = "El nombre es obligatorio";
  if (!EMAIL_REGEX.test(recipientEmailNormalized)) {
    errors.recipientEmail = "El email no es valido";
  }
  if (!recipientDni) errors.recipientDni = "El DNI es obligatorio";
  if (!serialNumber) errors.serialNumber = "El numero de serie es obligatorio";
  if (!certificateText) {
    errors.certificateText = "El texto principal es obligatorio";
  }
  if (!footerText) {
    errors.footerText = "El texto inferior es obligatorio";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      recipientName,
      recipientEmail,
      recipientEmailNormalized,
      recipientDni,
      certificateText,
      footerText,
      serialNumber,
    },
  };
}
