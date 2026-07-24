import {
  DonationCampaignStatus,
  DonationStatus,
  type Donation,
  type DonationCampaign,
} from "@/generated/prisma";
import { NextResponse } from "next/server";
import { DonationServiceError } from "./serviceErrors";

export type RouteContextWithId = {
  params: Promise<{ id: string }> | { id: string };
};

export async function getRouteId(context: RouteContextWithId): Promise<number> {
  const params = await context.params;
  return Number(params.id);
}

export function isValidRouteId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

export function decimalToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value);
}

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export function getOptionalFormFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export function mapDonationServiceError(error: unknown) {
  if (error instanceof DonationServiceError) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
        errors: error.details,
        success: false,
      },
      { status: error.status },
    );
  }

  return null;
}

export function serializeCampaign(
  campaign: DonationCampaign & {
    progress?: {
      approvedTotal: string;
      percentage: number;
      visualPercentage: number;
      isCompleted: boolean;
    };
    funds?: {
      directApprovedTotal: string;
      incomingTransferTotal: string;
      approvedTotal: string;
      outgoingTransferAmount: string;
      outgoingTransferTargetCampaignId: number | null;
      pendingOutgoingTransfer: boolean;
      hasIncomingTransfers: boolean;
      hasOutgoingTransfer: boolean;
    };
    donationCounts?: Partial<Record<DonationStatus, number>>;
  },
) {
  return {
    id: campaign.id,
    institutionName: campaign.institutionName,
    locality: campaign.locality,
    address: campaign.address,
    placeImageUrl: campaign.placeImageUrl,
    placeImagePublicId: campaign.placeImagePublicId,
    youtubeVideoUrl: campaign.youtubeVideoUrl,
    invoiceImageUrl: campaign.invoiceImageUrl,
    invoiceImagePublicId: campaign.invoiceImagePublicId,
    invoiceImageResourceType: campaign.invoiceImageResourceType,
    invoiceImageOriginalName: campaign.invoiceImageOriginalName,
    invoiceImageBytes: campaign.invoiceImageBytes,
    goalAmount: decimalToString(campaign.goalAmount),
    status: campaign.status,
    completedAt: campaign.completedAt?.toISOString() ?? null,
    archivedAt: campaign.archivedAt?.toISOString() ?? null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    progress: campaign.progress,
    funds: campaign.funds,
    donationCounts: {
      pending: campaign.donationCounts?.[DonationStatus.PENDING] ?? 0,
      approved: campaign.donationCounts?.[DonationStatus.APPROVED] ?? 0,
      rejected: campaign.donationCounts?.[DonationStatus.REJECTED] ?? 0,
    },
  };
}

export function serializeDonation(
  donation: Donation & {
    campaign?: Pick<
      DonationCampaign,
      "id" | "institutionName" | "locality" | "status"
    >;
  },
) {
  return {
    id: donation.id,
    campaignId: donation.campaignId,
    campaign: donation.campaign
      ? {
          id: donation.campaign.id,
          institutionName: donation.campaign.institutionName,
          locality: donation.campaign.locality,
          status: donation.campaign.status,
        }
      : undefined,
    amount: decimalToString(donation.amount),
    isAnonymous: donation.isAnonymous,
    firstName: donation.firstName,
    lastName: donation.lastName,
    email: donation.email,
    status: donation.status,
    receiptUrl: donation.receiptUrl,
    receiptPublicId: donation.receiptPublicId,
    receiptResourceType: donation.receiptResourceType,
    receiptOriginalName: donation.receiptOriginalName,
    receiptBytes: donation.receiptBytes,
    createdAt: donation.createdAt.toISOString(),
    updatedAt: donation.updatedAt.toISOString(),
    reviewedAt: donation.reviewedAt?.toISOString() ?? null,
  };
}

export function getCampaignStatusFilter(
  status: string | null,
): DonationCampaignStatus | undefined {
  if (status === DonationCampaignStatus.ACTIVE) return DonationCampaignStatus.ACTIVE;
  if (status === DonationCampaignStatus.COMPLETED) {
    return DonationCampaignStatus.COMPLETED;
  }
  if (status === DonationCampaignStatus.ARCHIVED) {
    return DonationCampaignStatus.ARCHIVED;
  }

  return undefined;
}

export function getDonationStatusFilter(
  status: string | null,
): DonationStatus | undefined {
  if (status === DonationStatus.PENDING) return DonationStatus.PENDING;
  if (status === DonationStatus.APPROVED) return DonationStatus.APPROVED;
  if (status === DonationStatus.REJECTED) return DonationStatus.REJECTED;

  return undefined;
}
