type ConfirmEmailTemplateInput = {
  name: string;
  confirmUrl: string;
};

export function confirmEmailSubject() {
  return "Confirma tu cuenta de Argentina Reanima";
}

export function confirmEmailText({ name, confirmUrl }: ConfirmEmailTemplateInput) {
  return [
    `Hola ${name},`,
    "",
    "Confirma tu cuenta de Argentina Reanima abriendo este link:",
    confirmUrl,
    "",
    "El link vence en 24 horas.",
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function confirmEmailHtml({
  name,
  confirmUrl,
}: ConfirmEmailTemplateInput) {
  const escapedName = escapeHtml(name);
  const escapedConfirmUrl = escapeHtml(confirmUrl);

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h1 style="font-size: 22px;">Confirma tu cuenta</h1>
      <p>Hola ${escapedName},</p>
      <p>Para completar tu registro en Argentina Reanima, confirma tu email desde el siguiente enlace:</p>
      <p>
        <a href="${escapedConfirmUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">
          Confirmar email
        </a>
      </p>
      <p>Si el boton no funciona, copia y pega este link en tu navegador:</p>
      <p><a href="${escapedConfirmUrl}">${escapedConfirmUrl}</a></p>
      <p>El link vence en 24 horas.</p>
    </div>
  `;
}
