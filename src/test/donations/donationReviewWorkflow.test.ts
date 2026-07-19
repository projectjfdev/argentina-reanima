import { DonationCampaignStatus, DonationStatus } from "@/generated/prisma";
import {
  approveDonation,
  reopenDonationReview,
  updateApprovedDonationAmount,
} from "@/libs/donations";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
}));

vi.mock("@/libs/db", () => ({
  prisma: prismaMock,
}));

function createTransactionClient() {
  return {
    donation: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      updateMany: vi.fn(),
      aggregate: vi.fn(),
    },
    donationCampaign: {
      update: vi.fn(),
    },
  };
}

function runInTransaction(tx: ReturnType<typeof createTransactionClient>) {
  prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));
}

describe("donation review workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not approve a rejected donation directly", async () => {
    const tx = createTransactionClient();
    runInTransaction(tx);
    tx.donation.findUnique.mockResolvedValue({
      id: 10,
      status: DonationStatus.REJECTED,
      campaign: {
        id: 3,
        status: DonationCampaignStatus.ACTIVE,
        goalAmount: "100000.00",
      },
    });

    await expect(approveDonation(10, "3000")).rejects.toMatchObject({
      code: "DONATION_ALREADY_REJECTED",
      status: 409,
    });
    expect(tx.donation.updateMany).not.toHaveBeenCalled();
  });

  it("updates only the amount of an approved donation and refreshes campaign state", async () => {
    const tx = createTransactionClient();
    runInTransaction(tx);
    tx.donation.findUnique.mockResolvedValue({
      id: 11,
      campaignId: 3,
      status: DonationStatus.APPROVED,
      amount: "30000.00",
      campaign: {
        id: 3,
        status: DonationCampaignStatus.COMPLETED,
        goalAmount: "50000.00",
      },
    });
    tx.donation.updateMany.mockResolvedValue({ count: 1 });
    tx.donation.findUniqueOrThrow.mockResolvedValue({
      id: 11,
      campaignId: 3,
      status: DonationStatus.APPROVED,
      amount: "3000.00",
    });
    tx.donation.aggregate.mockResolvedValue({ _sum: { amount: "3000.00" } });
    tx.donationCampaign.update.mockResolvedValue({
      id: 3,
      status: DonationCampaignStatus.ACTIVE,
    });

    const result = await updateApprovedDonationAmount(11, "3000");

    expect(tx.donation.updateMany).toHaveBeenCalledWith({
      where: { id: 11, status: DonationStatus.APPROVED },
      data: {
        amount: "3000.00",
        reviewedAt: expect.any(Date),
      },
    });
    expect(tx.donationCampaign.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: {
        status: DonationCampaignStatus.ACTIVE,
        completedAt: null,
      },
    });
    expect(result.donation.amount).toBe("3000.00");
  });

  it("reopens an approved donation by clearing amount and returning it to pending", async () => {
    const tx = createTransactionClient();
    runInTransaction(tx);
    tx.donation.findUnique.mockResolvedValue({
      id: 12,
      campaignId: 4,
      status: DonationStatus.APPROVED,
      amount: "30000.00",
      campaign: {
        id: 4,
        status: DonationCampaignStatus.COMPLETED,
        goalAmount: "50000.00",
      },
    });
    tx.donation.updateMany.mockResolvedValue({ count: 1 });
    tx.donation.findUniqueOrThrow.mockResolvedValue({
      id: 12,
      campaignId: 4,
      status: DonationStatus.PENDING,
      amount: null,
      reviewedAt: null,
    });
    tx.donation.aggregate.mockResolvedValue({ _sum: { amount: "0.00" } });
    tx.donationCampaign.update.mockResolvedValue({
      id: 4,
      status: DonationCampaignStatus.ACTIVE,
    });

    const result = await reopenDonationReview(12);

    expect(tx.donation.updateMany).toHaveBeenCalledWith({
      where: {
        id: 12,
        status: { in: [DonationStatus.APPROVED, DonationStatus.REJECTED] },
      },
      data: {
        amount: null,
        status: DonationStatus.PENDING,
        reviewedAt: null,
      },
    });
    expect(result.donation).toMatchObject({
      status: DonationStatus.PENDING,
      amount: null,
    });
  });
});
