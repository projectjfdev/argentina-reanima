import { getCertificateInstructorByKey } from "./certificateSignatures";
import {
  getCertificateTemplateByKey,
  normalizeCertificateTemplateKey,
  type CertificateTemplateKey,
} from "./certificateTemplates";
import {
  CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER,
  certificateTextHasRecipientNamePlaceholder,
} from "./certificateTextTemplate";
import { normalizeCertificateEmail } from "./normalizeCertificateEmail";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CertificatePayloadInput = {
  recipientName?: unknown;
  recipientEmail?: unknown;
  recipientDni?: unknown;
  certificateText?: unknown;
  footerText?: unknown;
  templateKey?: unknown;
  instructorSignatureEnabled?: unknown;
  instructorKey?: unknown;
};

export type ValidCertificatePayload = {
  recipientName: string;
  recipientEmail: string;
  recipientEmailNormalized: string;
  recipientDni: string | null;
  certificateText: string;
  footerText: string;
  templateKey: CertificateTemplateKey;
  instructorSignatureEnabled: boolean;
  instructorKey: string | null;
};

export type CertificatePayloadValidationResult =
  | { success: true; data: ValidCertificatePayload }
  | { success: false; errors: Record<string, string> };

function getTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(value: unknown): boolean {
  return value === true;
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
  const templateKey = normalizeCertificateTemplateKey(input.templateKey);
  const instructorSignatureEnabled = getBoolean(
    input.instructorSignatureEnabled,
  );
  const instructorKey = getTrimmedString(input.instructorKey);

  const errors: Record<string, string> = {};

  if (!recipientName) errors.recipientName = "El nombre es obligatorio";
  if (!EMAIL_REGEX.test(recipientEmailNormalized)) {
    errors.recipientEmail = "El email no es valido";
  }
  if (!certificateText) {
    errors.certificateText = "El texto principal es obligatorio";
  } else if (!certificateTextHasRecipientNamePlaceholder(certificateText)) {
    errors.certificateText = `El texto principal debe incluir ${CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER} para insertar el nombre automaticamente`;
  }
  if (!footerText) {
    errors.footerText = "El texto inferior es obligatorio";
  }
  if (!getCertificateTemplateByKey(templateKey)) {
    errors.templateKey = "La plantilla seleccionada no es valida";
  }
  if (
    instructorSignatureEnabled &&
    !getCertificateInstructorByKey(instructorKey)
  ) {
    errors.instructorKey = "El instructor seleccionado no es valido";
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
      recipientDni: recipientDni || null,
      certificateText,
      footerText,
      templateKey: templateKey as CertificateTemplateKey,
      instructorSignatureEnabled,
      instructorKey: instructorSignatureEnabled ? instructorKey : null,
    },
  };
}
