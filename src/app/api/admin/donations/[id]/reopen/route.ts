import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { reopenDonationReview } from "@/libs/donations";
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

export async function POST(
  _request: NextRequest,
  context: RouteContextWithId,
) {
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

    const result = await reopenDonationReview(donationId);

    revalidateDonationViews(result.donation.campaignId);

    return NextResponse.json({
      message: "Donacion reabierta correctamente",
      donation: serializeDonation(result.donation),
      updatedCampaignId: result.campaign?.id ?? null,
      success: true,
    });
  } catch (error) {
    const serviceResponse = mapDonationServiceError(error);
    if (serviceResponse) return serviceResponse;

    console.error("Error in POST /api/admin/donations/[id]/reopen:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
