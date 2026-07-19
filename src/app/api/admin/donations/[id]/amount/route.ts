import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { updateApprovedDonationAmount } from "@/libs/donations";
import {
  getRouteId,
  isValidRouteId,
  mapDonationServiceError,
  serializeDonation,
  type RouteContextWithId,
} from "@/libs/donations/adminApi";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function revalidateDonationViews(campaignId: number) {
  revalidatePath("/donar");
  revalidatePath("/api/donation-campaigns/current");
  revalidatePath(`/api/donation-campaigns/${campaignId}/donors`);
}

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

    revalidateDonationViews(result.donation.campaignId);

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
