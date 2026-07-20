import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { rejectDonation } from "@/libs/donations";
import {
  getRouteId,
  isValidRouteId,
  mapDonationServiceError,
  serializeDonation,
  type RouteContextWithId,
} from "@/libs/donations/adminApi";
import { NextRequest, NextResponse } from "next/server";


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

    const donation = await rejectDonation(donationId);

    return NextResponse.json({
      message: "Donacion rechazada correctamente",
      donation: serializeDonation(donation),
      success: true,
    });
  } catch (error) {
    const serviceResponse = mapDonationServiceError(error);
    if (serviceResponse) return serviceResponse;

    console.error("Error in POST /api/admin/donations/[id]/reject:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
