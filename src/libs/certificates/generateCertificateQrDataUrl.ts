import QRCode from "qrcode";

export async function generateCertificateQrDataUrl(
  publicUrl: string,
): Promise<string> {
  return QRCode.toDataURL(publicUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });
}
