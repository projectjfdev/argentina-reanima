export const CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER = "{{nombre}}";

export const DEFAULT_CERTIFICATE_TEXT_TEMPLATE = `Se deja constancia que ${CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER} ha participado de la actividad indicada por Argentina Reanima.`;

export function certificateTextHasRecipientNamePlaceholder(
  certificateText: string,
): boolean {
  return certificateText.includes(CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER);
}

export function renderCertificateTextTemplate(
  certificateText: string,
  recipientName?: string | null,
): string {
  const renderedName = recipientName?.trim() || "la persona destinataria";

  return certificateText.replaceAll(
    CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER,
    renderedName,
  );
}
