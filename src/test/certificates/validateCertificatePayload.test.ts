import {
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
  validateCertificatePayload,
} from "@/libs/certificates";
import { describe, expect, it } from "vitest";

const VALID_PAYLOAD = {
  recipientName: "Ana Perez",
  recipientEmail: "ana@example.com",
  recipientDni: "",
  certificateText: DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
  footerText: "Actividad certificada.",
  templateKey: DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  instructorSignatureEnabled: false,
  instructorKey: "none",
};

describe("validateCertificatePayload", () => {
  it("accepts a certificate text with the name placeholder", () => {
    expect(validateCertificatePayload(VALID_PAYLOAD).success).toBe(true);
  });

  it("defaults to template_1 when templateKey is absent", () => {
    const { templateKey: _templateKey, ...payloadWithoutTemplate } =
      VALID_PAYLOAD;

    const result = validateCertificatePayload(payloadWithoutTemplate);

    expect(result).toEqual({
      success: true,
      data: {
        recipientName: "Ana Perez",
        recipientEmail: "ana@example.com",
        recipientEmailNormalized: "ana@example.com",
        recipientDni: null,
        certificateText: DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
        footerText: "Actividad certificada.",
        templateKey: DEFAULT_CERTIFICATE_TEMPLATE_KEY,
        instructorSignatureEnabled: false,
        instructorKey: null,
      },
    });
  });

  it("accepts a valid certificate template", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      templateKey: "template_2",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        templateKey: "template_2",
      },
    });
  });

  it("rejects an invalid certificate template", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      templateKey: "template_99",
    });

    expect(result).toEqual({
      success: false,
      errors: {
        templateKey: "La plantilla seleccionada no es valida",
      },
    });
  });

  it("rejects a certificate text without the name placeholder", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      certificateText: "Se deja constancia que Ana Perez participo.",
    });

    expect(result).toEqual({
      success: false,
      errors: {
        certificateText:
          "El texto principal debe incluir {{nombre}} para insertar el nombre automaticamente",
      },
    });
  });
});
