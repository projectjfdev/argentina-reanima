import { DonationCampaignStatus, DonationStatus } from "@/generated/prisma";
import { prisma } from "@/libs/db";
import { calculateCampaignProgress } from "./campaignProgress";
import { validateMoneyAmount } from "./money";
import { createValidationError } from "./serviceErrors";

type DonationTransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type CampaignFundsSummary = {
  directApprovedTotal: string;
  incomingTransferTotal: string;
  approvedTotal: string;
  outgoingTransferAmount: string;
  outgoingTransferTargetCampaignId: number | null;
  pendingOutgoingTransfer: boolean;
  hasIncomingTransfers: boolean;
  hasOutgoingTransfer: boolean;
};

function decimalToString(value: unknown): string {
  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value ?? "0");
}

function moneyToCents(value: unknown): bigint {
  const money = validateMoneyAmount(decimalToString(value), { allowZero: true });

  if (!money.success) {
    throw createValidationError({ amount: money.error });
  }

  return money.data.cents;
}

function centsToMoney(cents: bigint): string {
  const sign = cents < BigInt(0) ? "-" : "";
  const absoluteCents = cents < BigInt(0) ? -cents : cents;
  const units = absoluteCents / BigInt(100);
  const decimals = (absoluteCents % BigInt(100)).toString().padStart(2, "0");

  return `${sign}${units.toString()}.${decimals}`;
}

function addMoney(...values: unknown[]): string {
  return centsToMoney(
    values.reduce<bigint>(
      (total, value) => total + moneyToCents(value),
      BigInt(0),
    ),
  );
}

async function getDirectApprovedDonationTotal(
  campaignId: number,
  client: DonationTransactionClient,
): Promise<string> {
  const aggregate = await client.donation.aggregate({
    where: {
      campaignId,
      status: DonationStatus.APPROVED,
    },
    _sum: {
      amount: true,
    },
  });

  return decimalToString(aggregate._sum.amount ?? "0");
}

async function getIncomingTransferTotal(
  campaignId: number,
  client: DonationTransactionClient,
): Promise<string> {
  const aggregate = await client.donationCampaignTransfer.aggregate({
    where: {
      targetCampaignId: campaignId,
    },
    _sum: {
      amount: true,
    },
  });

  return decimalToString(aggregate._sum.amount ?? "0");
}

export async function getCampaignFundsSummary(
  campaignId: number,
  client: DonationTransactionClient = prisma,
): Promise<CampaignFundsSummary> {
  const [directApprovedTotal, incomingTransferTotal, outgoingTransfer] =
    await Promise.all([
      getDirectApprovedDonationTotal(campaignId, client),
      getIncomingTransferTotal(campaignId, client),
      client.donationCampaignTransfer.findUnique({
        where: { sourceCampaignId: campaignId },
        select: {
          amount: true,
          targetCampaignId: true,
        },
      }),
    ]);

  const outgoingTransferAmount = decimalToString(outgoingTransfer?.amount ?? "0");
  const incomingTransferCents = moneyToCents(incomingTransferTotal);
  const outgoingTransferCents = moneyToCents(outgoingTransferAmount);

  return {
    directApprovedTotal,
    incomingTransferTotal,
    approvedTotal: addMoney(directApprovedTotal, incomingTransferTotal),
    outgoingTransferAmount,
    outgoingTransferTargetCampaignId: outgoingTransfer?.targetCampaignId ?? null,
    pendingOutgoingTransfer:
      Boolean(outgoingTransfer) && outgoingTransfer?.targetCampaignId === null,
    hasIncomingTransfers: incomingTransferCents > BigInt(0),
    hasOutgoingTransfer: outgoingTransferCents > BigInt(0),
  };
}

async function findNextActiveCampaign(
  sourceCampaign: { id: number; createdAt: Date },
  client: DonationTransactionClient,
) {
  return client.donationCampaign.findFirst({
    where: {
      id: { not: sourceCampaign.id },
      status: DonationCampaignStatus.ACTIVE,
      createdAt: { gt: sourceCampaign.createdAt },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
}

export async function syncCampaignOverflow(
  campaignId: number,
  client: DonationTransactionClient = prisma,
) {
  const campaign = await client.donationCampaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      goalAmount: true,
      createdAt: true,
    },
  });

  if (!campaign) return null;

  const directApprovedTotal = await getDirectApprovedDonationTotal(
    campaign.id,
    client,
  );
  const overflowCents =
    moneyToCents(directApprovedTotal) - moneyToCents(campaign.goalAmount);
  const overflowAmount =
    overflowCents > BigInt(0) ? centsToMoney(overflowCents) : "0.00";

  const existingTransfer = await client.donationCampaignTransfer.findUnique({
    where: { sourceCampaignId: campaign.id },
    select: {
      id: true,
      targetCampaignId: true,
    },
  });

  if (overflowCents <= BigInt(0)) {
    if (!existingTransfer) return null;

    if (existingTransfer.targetCampaignId === null) {
      await client.donationCampaignTransfer.delete({
        where: { sourceCampaignId: campaign.id },
      });
      return null;
    }

    return client.donationCampaignTransfer.update({
      where: { sourceCampaignId: campaign.id },
      data: { amount: "0.00" },
    });
  }

  const nextCampaign = existingTransfer?.targetCampaignId
    ? null
    : await findNextActiveCampaign(campaign, client);
  const targetCampaignId =
    existingTransfer?.targetCampaignId ?? nextCampaign?.id ?? null;
  const appliedAt =
    targetCampaignId && !existingTransfer?.targetCampaignId ? new Date() : undefined;

  return client.donationCampaignTransfer.upsert({
    where: { sourceCampaignId: campaign.id },
    create: {
      sourceCampaignId: campaign.id,
      targetCampaignId,
      amount: overflowAmount,
      appliedAt: targetCampaignId ? (appliedAt ?? new Date()) : null,
    },
    update: {
      amount: overflowAmount,
      ...(targetCampaignId && {
        targetCampaignId,
        ...(appliedAt && { appliedAt }),
      }),
    },
  });
}

export async function applyPendingTransfersToCampaign(
  targetCampaign: { id: number; createdAt: Date },
  client: DonationTransactionClient = prisma,
) {
  const pendingTransfers = await client.donationCampaignTransfer.findMany({
    where: {
      targetCampaignId: null,
      amount: { gt: 0 },
      sourceCampaignId: { not: targetCampaign.id },
      sourceCampaign: {
        createdAt: { lt: targetCampaign.createdAt },
      },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (pendingTransfers.length === 0) {
    return [];
  }

  const appliedAt = new Date();

  await Promise.all(
    pendingTransfers.map((transfer) =>
      client.donationCampaignTransfer.update({
        where: { id: transfer.id },
        data: {
          targetCampaignId: targetCampaign.id,
          appliedAt,
        },
      }),
    ),
  );

  return pendingTransfers;
}

export async function getCampaignProgressFromFunds(
  campaign: { id: number; goalAmount: unknown },
  client: DonationTransactionClient = prisma,
) {
  const funds = await getCampaignFundsSummary(campaign.id, client);
  const progress = calculateCampaignProgress({
    goalAmount: decimalToString(campaign.goalAmount),
    approvedTotal: funds.approvedTotal,
  });

  if (!progress.success) {
    throw createValidationError(progress.errors);
  }

  return {
    funds,
    progress: {
      approvedTotal: progress.data.approvedTotal,
      percentage: progress.data.percentage,
      visualPercentage: progress.data.visualPercentage,
      isCompleted: progress.data.isCompleted,
    },
  };
}
