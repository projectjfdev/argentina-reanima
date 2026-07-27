import { CertificatesDashboard } from "@/components/Dashboard/Certificates/CertificatesDashboard";
import {
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
} from "@/libs/certificates";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

const fetchMock = vi.fn();

type CertificateFixture = {
  publicId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientEmailNormalized?: string;
  recipientDni?: string | null;
  certificateText?: string;
  footerText?: string;
  templateKey?: string;
  instructorSignatureEnabled?: boolean;
  instructorKey?: string | null;
  serialNumber?: string;
  status?: "ACTIVE" | "DELETED";
  publicUrl?: string;
  user?: null;
};

function createFetchResponse(data: unknown, ok = true) {
  return {
    ok,
    json: async () => data,
  };
}

function createListResponse(certificates: CertificateFixture[] = []) {
  return createFetchResponse({
    message: "Certificados obtenidos correctamente",
    certificates: certificates.map((certificate, index) => ({
      publicId: `cert-${index + 1}`,
      recipientName: "Ana Perez",
      recipientEmail: "ana@example.com",
      recipientEmailNormalized: "ana@example.com",
      recipientDni: null,
      certificateText: DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
      footerText: "Actividad certificada.",
      templateKey: DEFAULT_CERTIFICATE_TEMPLATE_KEY,
      instructorSignatureEnabled: false,
      instructorKey: null,
      serialNumber: `AR-${index + 1}`,
      status: "ACTIVE",
      publicUrl: `http://localhost/cert-${index + 1}`,
      user: null,
      ...certificate,
    })),
    totalPages: 1,
    success: true,
  });
}

function createMutationResponse() {
  return createFetchResponse({
    message: "Certificado guardado",
    certificate: {
      publicId: "saved-cert",
      recipientName: "Pepe Perez",
      recipientEmail: "pepe@example.com",
      recipientEmailNormalized: "pepe@example.com",
      recipientDni: null,
      certificateText: DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
      footerText: "Actividad certificada.",
      templateKey: DEFAULT_CERTIFICATE_TEMPLATE_KEY,
      instructorSignatureEnabled: true,
      instructorKey: "emir",
      serialNumber: "AR-9999",
      status: "ACTIVE",
      publicUrl: "http://localhost/saved-cert",
      user: null,
    },
    success: true,
  });
}

async function renderDashboardWithList(certificates: CertificateFixture[] = []) {
  fetchMock.mockResolvedValueOnce(createListResponse(certificates));

  render(<CertificatesDashboard />);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/certificates?page=1&pageSize=6&status=ACTIVE",
      { cache: "no-store" },
    );
  });
}

async function fillSingleCertificateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Nombre completo"), "Pepe Perez");
  await user.type(screen.getByPlaceholderText("persona@email.com"), "pepe@example.com");
  await user.type(
    screen.getByPlaceholderText(
      "La presente actividad tuvo caracter...",
    ),
    "Actividad certificada.",
  );
}

function getJsonFetchBody(url: string) {
  const call = fetchMock.mock.calls.find(([calledUrl]) => calledUrl === url);
  expect(call).toBeDefined();
  const init = call?.[1] as RequestInit;
  return JSON.parse(init.body as string) as Record<string, unknown>;
}

function getFormDataFetchBody(url: string, intent: string) {
  const call = fetchMock.mock.calls.find(([calledUrl, init]) => {
    if (calledUrl !== url) return false;
    const body = (init as RequestInit | undefined)?.body;
    return body instanceof FormData && body.get("intent") === intent;
  });

  expect(call).toBeDefined();
  return (call?.[1] as RequestInit).body as FormData;
}

describe("CertificatesDashboard instructor signature", () => {
  beforeAll(() => {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = vi.fn();
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = vi.fn();
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = vi.fn();
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("selects the first instructor, renders the signature and posts a valid key when enabling signature on create", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce(createListResponse())
      .mockResolvedValueOnce(createMutationResponse())
      .mockResolvedValueOnce(createListResponse());

    render(<CertificatesDashboard />);
    await fillSingleCertificateForm(user);
    await user.click(screen.getByLabelText(/Agregar firma de instructor/i));

    expect(await screen.findByAltText("Firma de Emir")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Crear certificado/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/certificates",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(getJsonFetchBody("/api/certificates")).toMatchObject({
      instructorSignatureEnabled: true,
      instructorKey: "emir",
      templateKey: DEFAULT_CERTIFICATE_TEMPLATE_KEY,
    });
  });

  it("posts null instructor key and hides the instructor signature when signature is disabled", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce(createListResponse())
      .mockResolvedValueOnce(createMutationResponse())
      .mockResolvedValueOnce(createListResponse());

    render(<CertificatesDashboard />);
    await fillSingleCertificateForm(user);

    expect(screen.queryByAltText("Firma de Emir")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Crear certificado/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/certificates",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(getJsonFetchBody("/api/certificates")).toMatchObject({
      instructorSignatureEnabled: false,
      instructorKey: null,
    });
  });

  it("enables a default instructor when editing a certificate without signature", async () => {
    const user = userEvent.setup();
    await renderDashboardWithList([
      {
        publicId: "cert-without-signature",
        instructorSignatureEnabled: false,
        instructorKey: null,
      },
    ]);
    fetchMock
      .mockResolvedValueOnce(createMutationResponse())
      .mockResolvedValueOnce(createListResponse());

    await user.click(screen.getByRole("button", { name: /Editar/i }));
    await user.click(screen.getByLabelText(/Agregar firma de instructor/i));

    expect(await screen.findByAltText("Firma de Emir")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/certificates/cert-without-signature",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    expect(getJsonFetchBody("/api/certificates/cert-without-signature")).toMatchObject({
      instructorSignatureEnabled: true,
      instructorKey: "emir",
    });
  });

  it("lets an existing signed certificate change instructor", async () => {
    const user = userEvent.setup();
    await renderDashboardWithList([
      {
        publicId: "cert-with-signature",
        instructorSignatureEnabled: true,
        instructorKey: "emir",
      },
    ]);
    fetchMock
      .mockResolvedValueOnce(createMutationResponse())
      .mockResolvedValueOnce(createListResponse());

    await user.click(screen.getByRole("button", { name: /Editar/i }));
    await user.click(screen.getAllByRole("combobox")[1]);
    const diegoOptions = await screen.findAllByText("Diego Lafalce");
    await user.click(diegoOptions[diegoOptions.length - 1]);
    await user.click(screen.getByRole("button", { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/certificates/cert-with-signature",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    expect(getJsonFetchBody("/api/certificates/cert-with-signature")).toMatchObject({
      instructorSignatureEnabled: true,
      instructorKey: "diego-lafalce",
    });
  });

  it("replaces an obsolete instructor key with the default instructor when editing a signed certificate", async () => {
    const user = userEvent.setup();
    await renderDashboardWithList([
      {
        publicId: "cert-obsolete-signature",
        instructorSignatureEnabled: true,
        instructorKey: "instructor-obsoleto",
      },
    ]);
    fetchMock
      .mockResolvedValueOnce(createMutationResponse())
      .mockResolvedValueOnce(createListResponse());

    await user.click(screen.getByRole("button", { name: /Editar/i }));

    expect(await screen.findByAltText("Firma de Emir")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/certificates/cert-obsolete-signature",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    expect(getJsonFetchBody("/api/certificates/cert-obsolete-signature")).toMatchObject({
      instructorSignatureEnabled: true,
      instructorKey: "emir",
    });
  });

  it("creates an Excel batch with a valid instructor key when enabling signature without touching the select", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce(createListResponse())
      .mockResolvedValueOnce(
        createFetchResponse({
          validRowCount: 1,
          previewRows: [
            {
              rowNumber: 2,
              recipientName: "Pepe Perez",
              recipientEmail: "pepe@example.com",
              recipientEmailNormalized: "pepe@example.com",
            },
          ],
          errors: [],
          success: true,
        }),
      )
      .mockResolvedValueOnce(
        createFetchResponse({
          createdCount: 1,
          serialRange: { from: "AR-0001", to: "AR-0001" },
          certificates: [],
          success: true,
        }),
      )
      .mockResolvedValueOnce(createListResponse());

    const { container } = render(<CertificatesDashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/certificates?page=1&pageSize=6&status=ACTIVE",
        { cache: "no-store" },
      );
    });

    await user.click(screen.getByRole("button", { name: /Excel/i }));
    await user.type(
      screen.getByPlaceholderText(
        "La presente actividad tuvo caracter...",
      ),
      "Actividad certificada.",
    );
    await user.click(screen.getByLabelText(/Agregar firma de instructor/i));

    expect(await screen.findByAltText("Firma de Emir")).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["excel"], "certificados.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        ],
      },
    });

    await screen.findByText("1 filas validas");
    await user.click(screen.getByRole("button", { name: /Crear lote/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/certificates/bulk",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const formData = getFormDataFetchBody("/api/certificates/bulk", "create");
    expect(formData.get("instructorSignatureEnabled")).toBe("true");
    expect(formData.get("instructorKey")).toBe("emir");
    expect(formData.get("instructorKey")).not.toBe("undefined");
    expect(formData.get("templateKey")).toBe(DEFAULT_CERTIFICATE_TEMPLATE_KEY);
  });
});
