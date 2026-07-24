import {
  applyPendingTransfersToCampaign,
  getCampaignFundsSummary,
  getCampaignProgressFromFunds,
  syncCampaignOverflow,
} from "@/libs/donations";
import { DonationCampaignStatus } from "@/generated/prisma";
import { describe, expect, it, vi } from "vitest";

function createClient() {
  return {
    donation: {
      aggregate: vi.fn(),
    },
    donationCampaign: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    donationCampaignTransfer: {
      aggregate: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe("campaign transfer service", () => {
  it("adds incoming transfers to destination campaign progress", async () => {
    const client = createClient();
    client.donation.aggregate.mockResolvedValue({
      _sum: { amount: "200000.00" },
    });
    client.donationCampaignTransfer.aggregate.mockResolvedValue({
      _sum: { amount: "150000.00" },
    });
    client.donationCampaignTransfer.findUnique.mockResolvedValue(null);

    const result = await getCampaignProgressFromFunds(
      { id: 2, goalAmount: "1000000.00" },
      client as never,
    );

    expect(result.funds).toMatchObject({
      directApprovedTotal: "200000.00",
      incomingTransferTotal: "150000.00",
      approvedTotal: "350000.00",
      hasIncomingTransfers: true,
    });
    expect(result.progress).toMatchObject({
      approvedTotal: "350000.00",
      percentage: 35,
      visualPercentage: 35,
      isCompleted: false,
    });
  });

  it("keeps source campaign total real and records outgoing overflow", async () => {
    const client = createClient();
    client.donation.aggregate.mockResolvedValue({
      _sum: { amount: "2150000.00" },
    });
    client.donationCampaignTransfer.aggregate.mockResolvedValue({
      _sum: { amount: "0.00" },
    });
    client.donationCampaignTransfer.findUnique.mockResolvedValue({
      amount: "150000.00",
      targetCampaignId: 8,
    });

    const summary = await getCampaignFundsSummary(1, client as never);

    expect(summary).toMatchObject({
      directApprovedTotal: "2150000.00",
      approvedTotal: "2150000.00",
      outgoingTransferAmount: "150000.00",
      outgoingTransferTargetCampaignId: 8,
      hasOutgoingTransfer: true,
    });
  });

  it("creates a pending overflow when there is no next campaign", async () => {
    const client = createClient();
    client.donationCampaign.findUnique.mockResolvedValue({
      id: 1,
      goalAmount: "2000000.00",
      createdAt: new Date("2026-07-01T00:00:00Z"),
    });
    client.donation.aggregate.mockResolvedValue({
      _sum: { amount: "2150000.00" },
    });
    client.donationCampaignTransfer.findUnique.mockResolvedValue(null);
    client.donationCampaign.findFirst.mockResolvedValue(null);
    client.donationCampaignTransfer.upsert.mockResolvedValue({
      sourceCampaignId: 1,
      targetCampaignId: null,
      amount: "150000.00",
    });

    await syncCampaignOverflow(1, client as never);

    expect(client.donationCampaignTransfer.upsert).toHaveBeenCalledWith({
      where: { sourceCampaignId: 1 },
      create: {
        sourceCampaignId: 1,
        targetCampaignId: null,
        amount: "150000.00",
        appliedAt: null,
      },
      update: {
        amount: "150000.00",
      },
    });
  });

  it("applies pending transfers to a newly created active campaign", async () => {
    const client = createClient();
    client.donationCampaignTransfer.findMany.mockResolvedValue([
      { id: 10 },
      { id: 11 },
    ]);
    client.donationCampaignTransfer.update.mockResolvedValue({});

    const targetCampaign = {
      id: 3,
      status: DonationCampaignStatus.ACTIVE,
      createdAt: new Date("2026-08-01T00:00:00Z"),
    };
    const result = await applyPendingTransfersToCampaign(
      targetCampaign,
      client as never,
    );

    expect(result).toHaveLength(2);
    expect(client.donationCampaignTransfer.update).toHaveBeenCalledTimes(2);
    expect(client.donationCampaignTransfer.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        targetCampaignId: 3,
        appliedAt: expect.any(Date),
      },
    });
  });
});
