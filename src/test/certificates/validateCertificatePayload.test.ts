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
        expiresAt: null,
      },
    });
  });

  it("accepts an absent expiration date", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      expiresAt: undefined,
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        expiresAt: null,
      },
    });
  });

  it("accepts an empty expiration date", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      expiresAt: "",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        expiresAt: null,
      },
    });
  });

  it("accepts a valid expiration date as a calendar date", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      expiresAt: "2028-10-15",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        expiresAt: new Date("2028-10-15T00:00:00.000Z"),
      },
    });
  });

  it("rejects an invalid expiration date", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      expiresAt: "2028-15-40",
    });

    expect(result).toEqual({
      success: false,
      errors: {
        expiresAt: "La fecha de vencimiento no es valida",
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

  it("accepts an enabled instructor signature with a valid instructor key", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      instructorSignatureEnabled: true,
      instructorKey: "emir",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        instructorSignatureEnabled: true,
        instructorKey: "emir",
      },
    });
  });

  it("rejects an enabled instructor signature without an instructor key", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      instructorSignatureEnabled: true,
      instructorKey: undefined,
    });

    expect(result).toEqual({
      success: false,
      errors: {
        instructorKey: "El instructor seleccionado no es valido",
      },
    });
  });

  it("rejects an enabled instructor signature with an obsolete instructor key", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      instructorSignatureEnabled: true,
      instructorKey: "instructor-obsoleto",
    });

    expect(result).toEqual({
      success: false,
      errors: {
        instructorKey: "El instructor seleccionado no es valido",
      },
    });
  });

  it("stores null instructor key when instructor signature is disabled", () => {
    const result = validateCertificatePayload({
      ...VALID_PAYLOAD,
      instructorSignatureEnabled: false,
      instructorKey: "emir",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        instructorSignatureEnabled: false,
        instructorKey: null,
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
