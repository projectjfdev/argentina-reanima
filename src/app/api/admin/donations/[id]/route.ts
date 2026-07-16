import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import {
  getRouteId,
  isValidRouteId,
  serializeDonation,
  type RouteContextWithId,
} from "@/libs/donations/adminApi";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
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

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        campaign: {
          select: {
            id: true,
            institutionName: true,
            locality: true,
            status: true,
          },
        },
      },
    });

    if (!donation) {
      return NextResponse.json(
        { message: "Donacion no encontrada", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({
      donation: serializeDonation(donation),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/donations/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
