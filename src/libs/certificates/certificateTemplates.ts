export const DEFAULT_CERTIFICATE_TEMPLATE_KEY = "template_1";

export const CERTIFICATE_TEMPLATES = [
  {
    key: "template_1",
    name: "Plantilla 1",
    imageSrc: "/certificado-template/certificado-template_1.png",
    description: "Plantilla principal de Argentina Reanima.",
  },
  {
    key: "template_2",
    name: "Plantilla 2",
    imageSrc: "/certificado-template/certificado-template_2.png",
    description: "Variante visual alternativa.",
  },
  {
    key: "template_3",
    name: "Plantilla 3",
    imageSrc: "/certificado-template/certificado-template_3.png",
    description: "Variante visual alternativa.",
  },
] as const;

export type CertificateTemplateKey =
  (typeof CERTIFICATE_TEMPLATES)[number]["key"];

export function getCertificateTemplateByKey(
  key: string | null | undefined,
) {
  return CERTIFICATE_TEMPLATES.find((template) => template.key === key);
}

export function getDefaultCertificateTemplate() {
  return getCertificateTemplateByKey(DEFAULT_CERTIFICATE_TEMPLATE_KEY);
}

export function normalizeCertificateTemplateKey(
  value: unknown,
): string {
  if (value === undefined || value === null) {
    return DEFAULT_CERTIFICATE_TEMPLATE_KEY;
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}
