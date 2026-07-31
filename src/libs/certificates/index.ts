export { generateCertificatePublicId } from "./generateCertificatePublicId";
export { generateCertificateQrDataUrl } from "./generateCertificateQrDataUrl";
export {
  generateNextCertificateSerialNumber,
  generateNextCertificateSerialNumbers,
} from "./generateCertificateSerialNumber";
export { generateUniqueCertificatePublicId } from "./generateUniqueCertificatePublicId";
export { getPublicCertificateUrl } from "./getPublicCertificateUrl";
export { linkCertificatesToUserByEmail } from "./linkCertificatesToUserByEmail";
export { normalizeCertificateEmail } from "./normalizeCertificateEmail";
export {
  formatCertificateDate,
  getCertificateDateInputValue,
  isCertificateDateInput,
  parseCertificateDateInput,
} from "./certificateDates";
export {
  CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER,
  DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
  certificateTextHasRecipientNamePlaceholder,
  renderCertificateTextTemplate,
} from "./certificateTextTemplate";
export {
  CERTIFICATE_INSTRUCTORS,
  CERTIFICATE_PRESIDENT_SIGNATURE,
  getCertificateInstructorByKey,
  type CertificateInstructorKey,
} from "./certificateSignatures";
export {
  CERTIFICATE_TEMPLATES,
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  getCertificateTemplateByKey,
  getDefaultCertificateTemplate,
  normalizeCertificateTemplateKey,
  type CertificateTemplateKey,
} from "./certificateTemplates";
export {
  validateCertificatePayload,
  type CertificatePayloadInput,
  type CertificatePayloadValidationResult,
  type ValidCertificatePayload,
} from "./validateCertificatePayload";
