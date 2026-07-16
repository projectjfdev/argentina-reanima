import { DonationCampaignStatus, DonationStatus, Prisma } from "@/generated/prisma";
import { prisma } from "@/libs/db";
import { calculateCampaignProgress } from "./campaignProgress";
import {
  destroyDonationAsset,
  uploadDonationCampaignPlaceImage,
} from "./cloudinaryDonationStorage";
import { createValidationError, DonationServiceError } from "./serviceErrors";
import {
  validateDonationCampaignPayload,
  type DonationCampaignPayloadInput,
} from "./validateDonationCampaignPayload";

type DonationTransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type CampaignProgressData = {
  approvedTotal: string;
  percentage: number;
  visualPercentage: number;
  isCompleted: boolean;
};

export type DonationCampaignWithImageInput = Omit<
  DonationCampaignPayloadInput,
  "placeImageUrl" | "placeImagePublicId"
>;

type CampaignWithProgress<TCampaign> = TCampaign & {
  progress: CampaignProgressData;
};

function decimalToString(value: unknown): string {
  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value ?? "0");
}

function isActiveCampaignUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("status")
  );
}

export function mapCampaignCreateError(error: unknown): never {
  if (isActiveCampaignUniqueError(error)) {
    throw new DonationServiceError({
      code: "ACTIVE_CAMPAIGN_EXISTS",
      message: "Ya existe una campana activa",
      status: 409,
    });
  }

  throw error;
}

export async function getApprovedDonationTotal(
  campaignId: number,
  client: DonationTransactionClient = prisma,
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

export async function getCampaignProgress(
  campaign: { id: number; goalAmount: unknown },
  client: DonationTransactionClient = prisma,
): Promise<CampaignProgressData> {
  const approvedTotal = await getApprovedDonationTotal(campaign.id, client);
  const progress = calculateCampaignProgress({
    goalAmount: decimalToString(campaign.goalAmount),
    approvedTotal,
  });

  if (!progress.success) {
    throw createValidationError(progress.errors);
  }

  return {
    approvedTotal: progress.data.approvedTotal,
    percentage: progress.data.percentage,
    visualPercentage: progress.data.visualPercentage,
    isCompleted: progress.data.isCompleted,
  };
}

export async function attachCampaignProgress<TCampaign extends { id: number; goalAmount: unknown }>(
  campaign: TCampaign,
  client: DonationTransactionClient = prisma,
): Promise<CampaignWithProgress<TCampaign>> {
  const progress = await getCampaignProgress(campaign, client);

  return {
    ...campaign,
    progress,
  };
}

export async function createDonationCampaign(input: DonationCampaignPayloadInput) {
  const validation = validateDonationCampaignPayload(input);

  if (!validation.success) {
    throw createValidationError(validation.errors);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const activeCampaign = await tx.donationCampaign.findFirst({
        where: { status: DonationCampaignStatus.ACTIVE },
        select: { id: true },
      });

      if (activeCampaign) {
        throw new DonationServiceError({
          code: "ACTIVE_CAMPAIGN_EXISTS",
          message: "Ya existe una campana activa",
          status: 409,
        });
      }

      return tx.donationCampaign.create({
        data: {
          ...validation.data,
          status: DonationCampaignStatus.ACTIVE,
        },
      });
    });
  } catch (error) {
    mapCampaignCreateError(error);
  }
}

export async function createDonationCampaignWithPlaceImage(
  input: DonationCampaignWithImageInput,
  placeImage: File,
) {
  const uploadedImage = await uploadDonationCampaignPlaceImage(placeImage);

  try {
    return await createDonationCampaign({
      ...input,
      placeImageUrl: uploadedImage.url,
      placeImagePublicId: uploadedImage.publicId,
    });
  } catch (error) {
    await destroyDonationAsset(uploadedImage.publicId, uploadedImage.resourceType);
    throw error;
  }
}

export async function updateActiveDonationCampaign(
  campaignId: number,
  input: DonationCampaignPayloadInput,
) {
  const validation = validateDonationCampaignPayload(input);

  if (!validation.success) {
    throw createValidationError(validation.errors);
  }

  return prisma.$transaction(async (tx) => {
    const campaign = await tx.donationCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new DonationServiceError({
        code: "CAMPAIGN_NOT_FOUND",
        message: "Campana no encontrada",
        status: 404,
      });
    }

    if (campaign.status !== DonationCampaignStatus.ACTIVE) {
      throw new DonationServiceError({
        code: "CAMPAIGN_NOT_ACTIVE",
        message: "Solo se puede editar una campana activa",
        status: 409,
      });
    }

    const updatedCampaign = await tx.donationCampaign.update({
      where: { id: campaignId },
      data: validation.data,
    });
    const progress = await getCampaignProgress(updatedCampaign, tx);

    if (progress.isCompleted) {
      return tx.donationCampaign.update({
        where: { id: campaignId },
        data: {
          status: DonationCampaignStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    return updatedCampaign;
  });
}

export async function updateActiveDonationCampaignWithPlaceImage(
  campaignId: number,
  input: DonationCampaignWithImageInput,
  placeImage?: File | null,
) {
  const existingCampaign = await prisma.donationCampaign.findUnique({
    where: { id: campaignId },
    select: {
      placeImageUrl: true,
      placeImagePublicId: true,
    },
  });

  if (!existingCampaign) {
    throw new DonationServiceError({
      code: "CAMPAIGN_NOT_FOUND",
      message: "Campana no encontrada",
      status: 404,
    });
  }

  if (!placeImage) {
    return updateActiveDonationCampaign(campaignId, {
      ...input,
      placeImageUrl: existingCampaign.placeImageUrl,
      placeImagePublicId: existingCampaign.placeImagePublicId,
    });
  }

  const uploadedImage = await uploadDonationCampaignPlaceImage(placeImage);

  try {
    const updatedCampaign = await updateActiveDonationCampaign(campaignId, {
      ...input,
      placeImageUrl: uploadedImage.url,
      placeImagePublicId: uploadedImage.publicId,
    });

    await destroyDonationAsset(existingCampaign.placeImagePublicId);

    return updatedCampaign;
  } catch (error) {
    await destroyDonationAsset(uploadedImage.publicId, uploadedImage.resourceType);
    throw error;
  }
}

export async function markDonationCampaignCompleted(campaignId: number) {
  return prisma.$transaction(async (tx) => {
    const campaign = await tx.donationCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new DonationServiceError({
        code: "CAMPAIGN_NOT_FOUND",
        message: "Campana no encontrada",
        status: 404,
      });
    }

    if (campaign.status === DonationCampaignStatus.ARCHIVED) {
      throw new DonationServiceError({
        code: "CAMPAIGN_NOT_ACTIVE",
        message: "No se puede completar una campana archivada",
        status: 409,
      });
    }

    if (campaign.status === DonationCampaignStatus.COMPLETED) {
      return campaign;
    }

    return tx.donationCampaign.update({
      where: { id: campaignId },
      data: {
        status: DonationCampaignStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  });
}

export async function archiveDonationCampaign(campaignId: number) {
  return prisma.$transaction(async (tx) => {
    const campaign = await tx.donationCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new DonationServiceError({
        code: "CAMPAIGN_NOT_FOUND",
        message: "Campana no encontrada",
        status: 404,
      });
    }

    if (campaign.status === DonationCampaignStatus.ARCHIVED) {
      return campaign;
    }

    return tx.donationCampaign.update({
      where: { id: campaignId },
      data: {
        status: DonationCampaignStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  });
}
