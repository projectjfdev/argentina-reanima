type ResetPasswordTemplateInput = {
  name: string;
  resetUrl: string;
};

export function resetPasswordSubject() {
  return "Recupera tu contraseña de Argentina Reanima";
}

export function resetPasswordText({
  name,
  resetUrl,
}: ResetPasswordTemplateInput) {
  return [
    `Hola ${name},`,
    "",
    "Recibimos una solicitud para cambiar la contraseña de tu cuenta de Argentina Reanima.",
    "Podes hacerlo desde este link:",
    resetUrl,
    "",
    "El link vence en 1 hora. Si no solicitaste este cambio, podes ignorar este email.",
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

export function resetPasswordHtml({
  name,
  resetUrl,
}: ResetPasswordTemplateInput) {
  const escapedName = escapeHtml(name);
  const escapedResetUrl = escapeHtml(resetUrl);

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h1 style="font-size: 22px;">Recupera tu contraseña</h1>
      <p>Hola ${escapedName},</p>
      <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta de Argentina Reanima.</p>
      <p>
        <a href="${escapedResetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">
          Cambiar contraseña
        </a>
      </p>
      <p>Si el botón no funciona, copiá y pegá este link en tu navegador:</p>
      <p><a href="${escapedResetUrl}">${escapedResetUrl}</a></p>
      <p>El link vence en 1 hora. Si no solicitaste este cambio, podés ignorar este email.</p>
    </div>
  `;
}
