import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { updateApprovedDonationAmount } from "@/libs/donations";
import {
  getRouteId,
  isValidRouteId,
  mapDonationServiceError,
  serializeDonation,
  type RouteContextWithId,
} from "@/libs/donations/adminApi";
import { revalidateDonationCampaignViews } from "@/libs/cache/revalidation";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(request: NextRequest, context: RouteContextWithId) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const donationId = await getRouteId(context);
    if (!isValidRouteId(donationId)) {
      return NextResponse.json(
        { message: "Donacion invalida", success: false },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await updateApprovedDonationAmount(donationId, body?.amount);

    revalidateDonationCampaignViews(result.donation.campaignId);

    return NextResponse.json({
      message: "Monto actualizado correctamente",
      donation: serializeDonation(result.donation),
      updatedCampaignId: result.campaign?.id ?? null,
      success: true,
    });
  } catch (error) {
    const serviceResponse = mapDonationServiceError(error);
    if (serviceResponse) return serviceResponse;

    console.error("Error in PATCH /api/admin/donations/[id]/amount:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
