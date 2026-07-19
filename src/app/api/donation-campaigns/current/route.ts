import { DonationCampaignStatus, DonationStatus } from "@/generated/prisma";
import { attachCampaignProgress } from "@/libs/donations";
import { prisma } from "@/libs/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INITIAL_DONORS_LIMIT = 10;

type PublicDonationCampaign = {
  id: number;
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
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
  },
) {
  return {
    id: campaign.id,
    institutionName: campaign.institutionName,
    locality: campaign.locality,
    address: campaign.address,
    placeImageUrl: campaign.placeImageUrl,
    goalAmount: decimalToString(campaign.goalAmount),
    status: campaign.status,
    completedAt: campaign.completedAt?.toISOString() ?? null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    approvedTotal: campaign.progress.approvedTotal,
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
