import cloudinary from "@/libs/cloudinary";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import {
  getRouteId,
  isValidRouteId,
  type RouteContextWithId,
} from "@/libs/donations/adminApi";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SIGNED_RECEIPT_TTL_SECONDS = 5 * 60;

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
      select: {
        id: true,
        receiptPublicId: true,
        receiptResourceType: true,
        receiptOriginalName: true,
        receiptBytes: true,
      },
    });

    if (!donation) {
      return NextResponse.json(
        { message: "Donacion no encontrada", success: false },
        { status: 404 },
      );
    }

    const expiresAt =
      Math.floor(Date.now() / 1000) + SIGNED_RECEIPT_TTL_SECONDS;
    const signedUrl = cloudinary.url(donation.receiptPublicId, {
      secure: true,
      sign_url: true,
      type: "authenticated",
      resource_type: donation.receiptResourceType,
      expires_at: expiresAt,
    });

    return NextResponse.json({
      receipt: {
        signedUrl,
        expiresAt,
        originalName: donation.receiptOriginalName,
        bytes: donation.receiptBytes,
        resourceType: donation.receiptResourceType,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/donations/[id]/receipt:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
