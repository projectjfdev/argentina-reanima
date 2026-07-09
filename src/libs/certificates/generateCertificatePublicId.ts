import { randomBytes } from "crypto";

const PUBLIC_ID_BYTES = 18;

export function generateCertificatePublicId(): string {
  return randomBytes(PUBLIC_ID_BYTES).toString("base64url");
}
