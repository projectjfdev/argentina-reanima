const DEFAULT_APP_URL = "http://localhost:3000";

function getBaseAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_APP_URL
  ).replace(/\/+$/, "");
}

export function getPublicCertificateUrl(publicId: string): string {
  return `${getBaseAppUrl()}/certificado/validar/${encodeURIComponent(
    publicId,
  )}`;
}
