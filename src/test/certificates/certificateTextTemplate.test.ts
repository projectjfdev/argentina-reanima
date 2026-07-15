import {
  DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
  certificateTextHasRecipientNamePlaceholder,
  renderCertificateTextTemplate,
} from "@/libs/certificates";
import { describe, expect, it } from "vitest";

describe("certificateTextTemplate", () => {
  it("ships the default template with the recipient placeholder", () => {
    expect(certificateTextHasRecipientNamePlaceholder(DEFAULT_CERTIFICATE_TEXT_TEMPLATE)).toBe(
      true,
    );
  });

  it("renders the recipient name into the certificate text", () => {
    expect(
      renderCertificateTextTemplate(
        "Se deja constancia que {{nombre}} participo.",
        "Ana Perez",
      ),
    ).toBe("Se deja constancia que Ana Perez participo.");
  });

  it("uses a fallback name when no recipient name is available", () => {
    expect(renderCertificateTextTemplate("Certifica a {{nombre}}.", "")).toBe(
      "Certifica a la persona destinataria.",
    );
  });
});
