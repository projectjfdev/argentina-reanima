import { DonationStatus } from "@/generated/prisma";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

type DonorsRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

type PublicDonor = {
  amount: unknown;
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
};

async function getCampaignId(context: DonorsRouteContext): Promise<number> {
  const params = await context.params;
  return Number(params.id);
}

function decimalToString(value: unknown): string {
  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value ?? "0");
}

function serializePublicDonor(donor: PublicDonor) {
  const fullName = [donor.firstName, donor.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    displayName: donor.isAnonymous ? "Anónimo" : fullName || "Anónimo",
    amount: decimalToString(donor.amount),
    createdAt: donor.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest, context: DonorsRouteContext) {
  await ensureRequestTimeRendering();

  try {
    const campaignId = await getCampaignId(context);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return NextResponse.json(
        { message: "Campana invalida", success: false },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );
    const skip = (page - 1) * pageSize;

    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { message: "Campana no encontrada", success: false },
        { status: 404 },
      );
    }

    const where = {
      campaignId,
      status: DonationStatus.APPROVED,
      amount: { not: null },
    };

    const [donors, totalDonors] = await prisma.$transaction([
      prisma.donation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          amount: true,
          isAnonymous: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json({
      donors: donors.map(serializePublicDonor),
      totalDonors,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalDonors / pageSize),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/donation-campaigns/[id]/donors:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
