import { DonationCampaignStatus, DonationStatus } from "@/generated/prisma";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import { attachCampaignProgress } from "@/libs/donations";
import { prisma } from "@/libs/db";
import { NextResponse } from "next/server";

const INITIAL_DONORS_LIMIT = 10;

type PublicDonationCampaign = {
  id: number;
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  youtubeVideoUrl: string | null;
  invoiceImageUrls: string[];
  invoiceImageUrl: string | null;
  invoiceImageOriginalName: string | null;
  goalAmount: unknown;
  status: DonationCampaignStatus;
  completedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PublicDonor = {
  amount: unknown;
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
};

function decimalToString(value: unknown): string {
  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value ?? "0");
}

function serializePublicDonor(donor: PublicDonor) {
  const fullName = [donor.firstName, donor.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    displayName: donor.isAnonymous ? "Anónimo" : fullName || "Anónimo",
    amount: decimalToString(donor.amount),
    createdAt: donor.createdAt.toISOString(),
  };
}

function serializePublicCampaign(
  campaign: PublicDonationCampaign & {
    progress: {
      approvedTotal: string;
      percentage: number;
      visualPercentage: number;
    };
    funds?: {
      directApprovedTotal: string;
      incomingTransferTotal: string;
      outgoingTransferAmount: string;
      hasIncomingTransfers: boolean;
      hasOutgoingTransfer: boolean;
    };
  },
) {
  return {
    id: campaign.id,
    institutionName: campaign.institutionName,
    locality: campaign.locality,
    address: campaign.address,
    placeImageUrl: campaign.placeImageUrl,
    youtubeVideoUrl: campaign.youtubeVideoUrl,
    invoiceImageUrls:
      campaign.invoiceImageUrls.length > 0
        ? campaign.invoiceImageUrls
        : campaign.invoiceImageUrl
          ? [campaign.invoiceImageUrl]
          : [],
    invoiceImageUrl: campaign.invoiceImageUrl,
    invoiceImageOriginalName: campaign.invoiceImageOriginalName,
    goalAmount: decimalToString(campaign.goalAmount),
    status: campaign.status,
    completedAt: campaign.completedAt?.toISOString() ?? null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    approvedTotal: campaign.progress.approvedTotal,
    directApprovedTotal:
      campaign.funds?.directApprovedTotal ?? campaign.progress.approvedTotal,
    incomingTransferTotal: campaign.funds?.incomingTransferTotal ?? "0.00",
    outgoingTransferAmount: campaign.funds?.outgoingTransferAmount ?? "0.00",
    hasIncomingTransfers: campaign.funds?.hasIncomingTransfers ?? false,
    hasOutgoingTransfer: campaign.funds?.hasOutgoingTransfer ?? false,
    percentage: campaign.progress.percentage,
    visualPercentage: campaign.progress.visualPercentage,
    canDonate: campaign.status === DonationCampaignStatus.ACTIVE,
  };
}

async function getCurrentPublicCampaign() {
  const activeCampaign = await prisma.donationCampaign.findFirst({
    where: { status: DonationCampaignStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      institutionName: true,
      locality: true,
      address: true,
      placeImageUrl: true,
      youtubeVideoUrl: true,
      invoiceImageUrls: true,
      invoiceImageUrl: true,
      invoiceImageOriginalName: true,
      goalAmount: true,
      status: true,
      completedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (activeCampaign) return activeCampaign;

  return prisma.donationCampaign.findFirst({
    where: { status: DonationCampaignStatus.COMPLETED },
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      institutionName: true,
      locality: true,
      address: true,
      placeImageUrl: true,
      youtubeVideoUrl: true,
      invoiceImageUrls: true,
      invoiceImageUrl: true,
      invoiceImageOriginalName: true,
      goalAmount: true,
      status: true,
      completedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function GET() {
  await ensureRequestTimeRendering();

  try {
    const campaign = await getCurrentPublicCampaign();

    if (!campaign) {
      return NextResponse.json({
        campaign: null,
        donors: [],
        success: true,
      });
    }

    const [campaignWithProgress, donors] = await Promise.all([
      attachCampaignProgress(campaign),
      prisma.donation.findMany({
        where: {
          campaignId: campaign.id,
          status: DonationStatus.APPROVED,
          amount: { not: null },
        },
        orderBy: { createdAt: "desc" },
        take: INITIAL_DONORS_LIMIT,
        select: {
          amount: true,
          isAnonymous: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      campaign: serializePublicCampaign(campaignWithProgress),
      donors: donors.map(serializePublicDonor),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/donation-campaigns/current:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
