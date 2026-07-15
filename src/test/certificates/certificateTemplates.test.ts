import {
  CERTIFICATE_TEMPLATES,
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  getCertificateTemplateByKey,
  getDefaultCertificateTemplate,
  normalizeCertificateTemplateKey,
} from "@/libs/certificates";
import { describe, expect, it } from "vitest";

describe("certificateTemplates", () => {
  it("defines the three selectable certificate templates", () => {
    expect(CERTIFICATE_TEMPLATES).toEqual([
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
    ]);
  });

  it("resolves a template by key", () => {
    expect(getCertificateTemplateByKey("template_2")).toMatchObject({
      key: "template_2",
      imageSrc: "/certificado-template/certificado-template_2.png",
    });
  });

  it("returns undefined for unknown template keys", () => {
    expect(getCertificateTemplateByKey("template_99")).toBeUndefined();
  });

  it("uses template_1 as the default template", () => {
    expect(DEFAULT_CERTIFICATE_TEMPLATE_KEY).toBe("template_1");
    expect(getDefaultCertificateTemplate()).toMatchObject({
      key: "template_1",
    });
  });

  it("normalizes absent values to the default template key", () => {
    expect(normalizeCertificateTemplateKey(undefined)).toBe("template_1");
    expect(normalizeCertificateTemplateKey(null)).toBe("template_1");
  });

  it("trims string values and rejects non-string values with an empty key", () => {
    expect(normalizeCertificateTemplateKey(" template_3 ")).toBe("template_3");
    expect(normalizeCertificateTemplateKey(3)).toBe("");
  });
});
