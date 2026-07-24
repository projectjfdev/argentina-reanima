import { DonationCampaignStatus, DonationStatus, Prisma } from "@/generated/prisma";
import { prisma } from "@/libs/db";
import {
  destroyDonationAsset,
  uploadDonationCampaignInvoiceImage,
  uploadDonationCampaignPlaceImage,
} from "./cloudinaryDonationStorage";
import {
  applyPendingTransfersToCampaign,
  getCampaignProgressFromFunds,
  syncCampaignOverflow,
  type CampaignFundsSummary,
} from "./campaignTransferService";
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
  funds: CampaignFundsSummary;
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
  const { progress } = await getCampaignProgressFromFunds(campaign, client);

  return progress;
}

export async function attachCampaignProgress<TCampaign extends { id: number; goalAmount: unknown }>(
  campaign: TCampaign,
  client: DonationTransactionClient = prisma,
): Promise<CampaignWithProgress<TCampaign>> {
  const { progress, funds } = await getCampaignProgressFromFunds(campaign, client);

  return {
    ...campaign,
    progress,
    funds,
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

      const campaign = await tx.donationCampaign.create({
        data: {
          ...validation.data,
          status: DonationCampaignStatus.ACTIVE,
        },
      });

      await applyPendingTransfersToCampaign(campaign, tx);

      const progress = await getCampaignProgress(campaign, tx);
      if (progress.isCompleted) {
        return tx.donationCampaign.update({
          where: { id: campaign.id },
          data: {
            status: DonationCampaignStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      return campaign;
    });
  } catch (error) {
    mapCampaignCreateError(error);
  }
}

export async function createDonationCampaignWithPlaceImage(
  input: DonationCampaignWithImageInput,
  placeImage: File,
  invoiceImage?: File | null,
) {
  const uploadedImage = await uploadDonationCampaignPlaceImage(placeImage);
  const uploadedInvoiceImage = invoiceImage
    ? await uploadDonationCampaignInvoiceImage(invoiceImage)
    : null;

  try {
    return await createDonationCampaign({
      ...input,
      placeImageUrl: uploadedImage.url,
      placeImagePublicId: uploadedImage.publicId,
      invoiceImageUrl: uploadedInvoiceImage?.url ?? null,
      invoiceImagePublicId: uploadedInvoiceImage?.publicId ?? null,
      invoiceImageResourceType: uploadedInvoiceImage?.resourceType ?? null,
      invoiceImageOriginalName: uploadedInvoiceImage?.originalName ?? null,
      invoiceImageBytes: uploadedInvoiceImage?.bytes ?? null,
    });
  } catch (error) {
    await destroyDonationAsset(uploadedImage.publicId, uploadedImage.resourceType);
    await destroyDonationAsset(
      uploadedInvoiceImage?.publicId,
      uploadedInvoiceImage?.resourceType,
    );
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

    const updatedCampaign = await tx.donationCampaign.update({
      where: { id: campaignId },
      data: validation.data,
    });
    const progress = await getCampaignProgress(updatedCampaign, tx);
    await syncCampaignOverflow(updatedCampaign.id, tx);

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
  invoiceImage?: File | null,
  removeInvoiceImage = false,
) {
  const existingCampaign = await prisma.donationCampaign.findUnique({
    where: { id: campaignId },
    select: {
      placeImageUrl: true,
      placeImagePublicId: true,
      invoiceImagePublicId: true,
      invoiceImageResourceType: true,
    },
  });

  if (!existingCampaign) {
    throw new DonationServiceError({
      code: "CAMPAIGN_NOT_FOUND",
      message: "Campana no encontrada",
      status: 404,
    });
  }

  const uploadedImage = placeImage
    ? await uploadDonationCampaignPlaceImage(placeImage)
    : null;
  const uploadedInvoiceImage = invoiceImage
    ? await uploadDonationCampaignInvoiceImage(invoiceImage)
    : null;

  try {
    const updatedCampaign = await updateActiveDonationCampaign(campaignId, {
      ...input,
      placeImageUrl: uploadedImage?.url ?? existingCampaign.placeImageUrl,
      placeImagePublicId:
        uploadedImage?.publicId ?? existingCampaign.placeImagePublicId,
      ...(uploadedInvoiceImage
        ? {
            invoiceImageUrl: uploadedInvoiceImage.url,
            invoiceImagePublicId: uploadedInvoiceImage.publicId,
            invoiceImageResourceType: uploadedInvoiceImage.resourceType,
            invoiceImageOriginalName: uploadedInvoiceImage.originalName ?? null,
            invoiceImageBytes: uploadedInvoiceImage.bytes ?? null,
          }
        : removeInvoiceImage
          ? {
              invoiceImageUrl: null,
              invoiceImagePublicId: null,
              invoiceImageResourceType: null,
              invoiceImageOriginalName: null,
              invoiceImageBytes: null,
            }
          : {}),
    });

    if (uploadedImage) {
      await destroyDonationAsset(existingCampaign.placeImagePublicId);
    }
    if (uploadedInvoiceImage || removeInvoiceImage) {
      await destroyDonationAsset(
        existingCampaign.invoiceImagePublicId,
        existingCampaign.invoiceImageResourceType ?? "image",
      );
    }

    return updatedCampaign;
  } catch (error) {
    await destroyDonationAsset(uploadedImage?.publicId, uploadedImage?.resourceType);
    await destroyDonationAsset(
      uploadedInvoiceImage?.publicId,
      uploadedInvoiceImage?.resourceType,
    );
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
      await syncCampaignOverflow(campaign.id, tx);
      return campaign;
    }

    const completedCampaign = await tx.donationCampaign.update({
      where: { id: campaignId },
      data: {
        status: DonationCampaignStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await syncCampaignOverflow(completedCampaign.id, tx);

    return completedCampaign;
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
