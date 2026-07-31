import { DonationCampaignStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import {
  archiveDonationCampaign,
  attachCampaignProgress,
  markDonationCampaignCompleted,
  updateActiveDonationCampaignWithPlaceImage,
} from "@/libs/donations";
import {
  getFormString,
  getOptionalFormFile,
  getOptionalFormFiles,
  getRouteId,
  isValidRouteId,
  mapDonationServiceError,
  serializeCampaign,
  type RouteContextWithId,
} from "@/libs/donations/adminApi";
import { revalidateDonationCampaignViews } from "@/libs/cache/revalidation";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";


async function getCampaignWithProgress(campaignId: number) {
  const campaign = await prisma.donationCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) return null;

  return attachCampaignProgress(campaign);
}

export async function GET(
  _request: NextRequest,
  context: RouteContextWithId,
) {
  await ensureRequestTimeRendering();

  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const campaignId = await getRouteId(context);
    if (!isValidRouteId(campaignId)) {
      return NextResponse.json(
        { message: "Campana invalida", success: false },
        { status: 400 },
      );
    }

    const campaign = await getCampaignWithProgress(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { message: "Campana no encontrada", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({
      campaign: serializeCampaign(campaign),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/donation-campaigns/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContextWithId) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const campaignId = await getRouteId(context);
    if (!isValidRouteId(campaignId)) {
      return NextResponse.json(
        { message: "Campana invalida", success: false },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const removeInvoiceImage = getFormString(formData, "removeInvoiceImage") === "true";
    const removeAdditionalImages =
      getFormString(formData, "removeAdditionalImages") === "true";
    const campaign = await updateActiveDonationCampaignWithPlaceImage(
      campaignId,
      {
        institutionName: getFormString(formData, "institutionName"),
        locality: getFormString(formData, "locality"),
        address: getFormString(formData, "address"),
        youtubeVideoUrl: getFormString(formData, "youtubeVideoUrl"),
        goalAmount: getFormString(formData, "goalAmount"),
      },
      getOptionalFormFile(formData, "placeImage"),
      getOptionalFormFile(formData, "invoiceImage"),
      removeInvoiceImage,
      getOptionalFormFiles(formData, "additionalImages"),
      removeAdditionalImages,
    );

    revalidateDonationCampaignViews(campaignId);

    return NextResponse.json({
      message: "Campana actualizada correctamente",
      campaign: serializeCampaign(await attachCampaignProgress(campaign)),
      success: true,
    });
  } catch (error) {
    const serviceResponse = mapDonationServiceError(error);
    if (serviceResponse) return serviceResponse;

    console.error("Error in PUT /api/admin/donation-campaigns/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContextWithId) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const campaignId = await getRouteId(context);
    if (!isValidRouteId(campaignId)) {
      return NextResponse.json(
        { message: "Campana invalida", success: false },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const status = body?.status;

    let campaign;
    if (status === DonationCampaignStatus.COMPLETED) {
      campaign = await markDonationCampaignCompleted(campaignId);
    } else if (status === DonationCampaignStatus.ARCHIVED) {
      campaign = await archiveDonationCampaign(campaignId);
    } else {
      return NextResponse.json(
        {
          message: "Estado de campana no soportado",
          success: false,
        },
        { status: 400 },
      );
    }

    revalidateDonationCampaignViews(campaignId);

    return NextResponse.json({
      message: "Estado de campana actualizado correctamente",
      campaign: serializeCampaign(await attachCampaignProgress(campaign)),
      success: true,
    });
  } catch (error) {
    const serviceResponse = mapDonationServiceError(error);
    if (serviceResponse) return serviceResponse;

    console.error("Error in PATCH /api/admin/donation-campaigns/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
