import { POST } from "@/app/api/donations/route";
import { createPendingDonationWithReceipt } from "@/libs/donations";
import { beforeEach, describe, expect, it, vi } from "vitest";

const donationsMock = vi.hoisted(() => {
  class DonationServiceError extends Error {
    code: string;
    status: number;
    details?: Record<string, string>;

    constructor({
      code,
      message,
      status,
      details,
    }: {
      code: string;
      message: string;
      status: number;
      details?: Record<string, string>;
    }) {
      super(message);
      this.name = "DonationServiceError";
      this.code = code;
      this.status = status;
      this.details = details;
    }
  }

  return {
    DonationServiceError,
    createPendingDonationWithReceipt: vi.fn(),
  };
});

const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/libs/donations", () => donationsMock);

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

const createPendingDonationWithReceiptMock = vi.mocked(
  createPendingDonationWithReceipt,
);

function createDonationRequest(formData: FormData) {
  return {
    formData: async () => formData,
  } as Parameters<typeof POST>[0];
}

function createReceipt() {
  return new File(["receipt"], "comprobante.png", { type: "image/png" });
}

describe("POST /api/donations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createPendingDonationWithReceiptMock.mockResolvedValue({
      id: 12,
      campaignId: 7,
      isAnonymous: false,
      firstName: "Ana",
      lastName: "Perez",
      status: "PENDING",
      createdAt: new Date("2026-07-16T10:00:00.000Z"),
    });
  });

  it("rejects public submissions that include amount", async () => {
    const formData = new FormData();
    formData.set("campaignId", "7");
    formData.set("visibility", "anonymous");
    formData.set("amount", "1000");
    formData.set("receipt", createReceipt());

    const response = await POST(createDonationRequest(formData));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      errors: {
        amount: "El monto lo ingresa un administrador al aprobar",
      },
    });
    expect(createPendingDonationWithReceiptMock).not.toHaveBeenCalled();
  });

  it("creates a pending donation without sending amount to the service", async () => {
    const receipt = createReceipt();
    const formData = new FormData();
    formData.set("campaignId", "7");
    formData.set("visibility", "public");
    formData.set("firstName", "Ana");
    formData.set("lastName", "Perez");
    formData.set("email", "ana@example.com");
    formData.set("receipt", receipt);

    const response = await POST(createDonationRequest(formData));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      success: true,
      donation: {
        isAnonymous: false,
        firstName: "Ana",
        lastName: "Perez",
        status: "PENDING",
      },
    });
    expect(body.donation).not.toHaveProperty("amount");
    expect(createPendingDonationWithReceiptMock).toHaveBeenCalledWith(
      {
        campaignId: "7",
        visibility: "public",
        firstName: "Ana",
        lastName: "Perez",
        email: "ana@example.com",
      },
      receipt,
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/donar");
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/api/donation-campaigns/current",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/api/donation-campaigns/7/donors",
    );
  });
});
