import { CertificateValidationContent } from "@/components/Dashboard/Certificates/CertificateValidationContent";
import { DEFAULT_CERTIFICATE_TEXT_TEMPLATE } from "@/libs/certificates";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/Dashboard/Certificates/CertificatePreview", () => ({
  CertificatePreview: () => <div data-testid="certificate-preview" />,
}));

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const CERTIFICATE = {
  recipientName: "Ana Perez",
  recipientDni: null,
  certificateText: DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
  footerText: "Actividad certificada.",
  templateKey: "template_1",
  serialNumber: "AR-0001",
  publicId: "public-id",
  publicUrl: "http://localhost/certificado/validar/public-id",
  instructorSignatureEnabled: false,
  instructorKey: null,
  qrDataUrl: "",
};

describe("CertificateValidationContent expiration date", () => {
  it("shows the expiration date when present", () => {
    render(
      <CertificateValidationContent
        certificate={{
          ...CERTIFICATE,
          expiresAt: "2028-10-15T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Fecha de vencimiento")).toBeInTheDocument();
    expect(screen.getByText("15/10/2028")).toBeInTheDocument();
  });

  it("does not show an expiration date block when absent", () => {
    render(
      <CertificateValidationContent
        certificate={{
          ...CERTIFICATE,
          expiresAt: null,
        }}
      />,
    );

    expect(screen.queryByText("Fecha de vencimiento")).not.toBeInTheDocument();
  });
});
