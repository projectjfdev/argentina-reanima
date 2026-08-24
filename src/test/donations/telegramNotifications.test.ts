import { prisma } from "@/libs/db";
import { sendTelegramMessage } from "@/libs/telegram";
import { notifyNewDonation } from "@/libs/donations/telegramNotifications";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/libs/db", () => ({
  prisma: {
    donationCampaign: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/libs/telegram", () => ({
  escapeTelegramHtml: (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;"),
  sendTelegramMessage: vi.fn(),
}));

const findUniqueMock = vi.mocked(prisma.donationCampaign.findUnique);
const sendTelegramMessageMock = vi.mocked(sendTelegramMessage);

describe("notifyNewDonation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendTelegramMessageMock.mockResolvedValue({ success: true });
  });

  it("sends campaign, donor and email details to Telegram", async () => {
    findUniqueMock.mockResolvedValue({
      institutionName: "Club San Martin",
      locality: "La Plata",
    });

    await notifyNewDonation({
      id: 12,
      campaignId: 7,
      isAnonymous: false,
      firstName: "Ana",
      lastName: "Perez",
      email: "ana@example.com",
      createdAt: new Date("2026-07-16T10:00:00.000Z"),
    });

    expect(sendTelegramMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Campana: Club San Martin - La Plata"),
    );
    expect(sendTelegramMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Donante: Ana Perez"),
    );
    expect(sendTelegramMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Email: ana@example.com"),
    );
  });

  it("reports anonymous donations without exposing a name", async () => {
    findUniqueMock.mockResolvedValue({
      institutionName: "Escuela 1",
      locality: "Rosario",
    });

    await notifyNewDonation({
      id: 13,
      campaignId: 8,
      isAnonymous: true,
      firstName: null,
      lastName: null,
      email: null,
      createdAt: new Date("2026-07-16T10:00:00.000Z"),
    });

    expect(sendTelegramMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Donante: Anonimo"),
    );
    expect(sendTelegramMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Email: Sin email"),
    );
  });
});
