import { DonationCampaignStatus, DonationStatus } from "@/generated/prisma";
import { prisma } from "@/libs/db";
import { getCampaignProgress } from "./campaignService";
import {
  destroyDonationAsset,
  uploadDonationReceipt,
} from "./cloudinaryDonationStorage";
import { validateMoneyAmount } from "./money";
import { createValidationError, DonationServiceError } from "./serviceErrors";
import {
  validateDonationPayload,
  type DonationPayloadInput,
} from "./validateDonationPayload";

type DonationTransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type DonationReceiptMetadata = {
  receiptUrl?: string | null;
  receiptPublicId: string;
  receiptResourceType: string;
  receiptOriginalName?: string | null;
  receiptBytes?: number | null;
};

export type CreatePendingDonationInput = DonationPayloadInput &
  DonationReceiptMetadata;

async function completeCampaignIfGoalReached(
  campaign: { id: number; status: DonationCampaignStatus; goalAmount: unknown },
  client: DonationTransactionClient,
) {
  const progress = await getCampaignProgress(campaign, client);

  if (!progress.isCompleted || campaign.status !== DonationCampaignStatus.ACTIVE) {
    return null;
  }

  return client.donationCampaign.update({
    where: { id: campaign.id },
    data: {
      status: DonationCampaignStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
}

export async function createPendingDonation(input: CreatePendingDonationInput) {
  const validation = validateDonationPayload(input);

  if (!validation.success) {
    throw createValidationError(validation.errors);
  }

  return prisma.$transaction(async (tx) => {
    const campaign = await tx.donationCampaign.findUnique({
      where: { id: validation.data.campaignId },
      select: { id: true, status: true },
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
        message: "La campana ya no acepta donaciones",
        status: 409,
      });
    }

    return tx.donation.create({
      data: {
        campaignId: validation.data.campaignId,
        isAnonymous: validation.data.isAnonymous,
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        email: validation.data.email,
        status: DonationStatus.PENDING,
        receiptUrl: input.receiptUrl ?? null,
        receiptPublicId: input.receiptPublicId,
        receiptResourceType: input.receiptResourceType,
        receiptOriginalName: input.receiptOriginalName ?? null,
        receiptBytes: input.receiptBytes ?? null,
      },
    });
  });
}

export async function createPendingDonationWithReceipt(
  input: DonationPayloadInput,
  receiptFile: File,
) {
  const uploadedReceipt = await uploadDonationReceipt(receiptFile);

  try {
    return await createPendingDonation({
      ...input,
      receiptUrl: uploadedReceipt.url,
      receiptPublicId: uploadedReceipt.publicId,
      receiptResourceType: uploadedReceipt.resourceType,
      receiptOriginalName: uploadedReceipt.originalName ?? null,
      receiptBytes: uploadedReceipt.bytes ?? null,
    });
  } catch (error) {
    await destroyDonationAsset(
      uploadedReceipt.publicId,
      uploadedReceipt.resourceType,
      "authenticated",
    );
    throw error;
  }
}

export async function approveDonation(donationId: number, amountInput: unknown) {
  const amount = validateMoneyAmount(amountInput);

  if (!amount.success) {
    throw createValidationError({ amount: amount.error });
  }

  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { campaign: true },
    });

    if (!donation) {
      throw new DonationServiceError({
        code: "DONATION_NOT_FOUND",
        message: "Donacion no encontrada",
        status: 404,
      });
    }

    if (donation.status === DonationStatus.APPROVED) {
      throw new DonationServiceError({
        code: "DONATION_ALREADY_APPROVED",
        message: "La donacion ya fue aprobada",
        status: 409,
      });
    }

    if (donation.status === DonationStatus.REJECTED) {
      throw new DonationServiceError({
        code: "DONATION_ALREADY_REJECTED",
        message: "No se puede aprobar una donacion rechazada",
        status: 409,
      });
    }

    const approvedDonation = await tx.donation.update({
      where: { id: donationId },
      data: {
        amount: amount.data.amount,
        status: DonationStatus.APPROVED,
        reviewedAt: new Date(),
      },
    });

    const completedCampaign = await completeCampaignIfGoalReached(
      donation.campaign,
      tx,
    );

    return {
      donation: approvedDonation,
      completedCampaign,
    };
  });
}

export async function rejectDonation(donationId: number) {
  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      throw new DonationServiceError({
        code: "DONATION_NOT_FOUND",
        message: "Donacion no encontrada",
        status: 404,
      });
    }

    if (donation.status === DonationStatus.APPROVED) {
      throw new DonationServiceError({
        code: "DONATION_ALREADY_APPROVED",
        message: "No se puede rechazar una donacion aprobada en esta version",
        status: 409,
      });
    }

    if (donation.status === DonationStatus.REJECTED) {
      return donation;
    }

    return tx.donation.update({
      where: { id: donationId },
      data: {
        status: DonationStatus.REJECTED,
        reviewedAt: new Date(),
      },
    });
  });
}
