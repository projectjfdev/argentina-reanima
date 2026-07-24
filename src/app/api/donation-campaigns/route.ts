import { DonationCampaignStatus } from "@/generated/prisma";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import { attachCampaignProgress } from "@/libs/donations";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 24;

type PublicCampaign = {
  id: number;
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  youtubeVideoUrl: string | null;
  invoiceImageUrl: string | null;
  invoiceImageOriginalName: string | null;
  goalAmount: unknown;
  status: DonationCampaignStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function decimalToString(value: unknown): string {
  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value ?? "0");
}

function serializeCampaign(
  campaign: PublicCampaign & {
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

export async function GET(request: NextRequest) {
  await ensureRequestTimeRendering();

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );
    const skip = (page - 1) * pageSize;
    const where = {
      status: {
        in: [DonationCampaignStatus.ACTIVE, DonationCampaignStatus.COMPLETED],
      },
    };

    const [campaigns, totalCampaigns] = await prisma.$transaction([
      prisma.donationCampaign.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { status: "asc" },
          { completedAt: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          institutionName: true,
          locality: true,
          address: true,
          placeImageUrl: true,
          youtubeVideoUrl: true,
          invoiceImageUrl: true,
          invoiceImageOriginalName: true,
          goalAmount: true,
          status: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.donationCampaign.count({ where }),
    ]);

    const campaignsWithProgress = await Promise.all(
      campaigns.map((campaign) => attachCampaignProgress(campaign)),
    );

    return NextResponse.json({
      campaigns: campaignsWithProgress.map(serializeCampaign),
      totalCampaigns,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCampaigns / pageSize),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/donation-campaigns:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
