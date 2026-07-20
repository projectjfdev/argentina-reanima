import { Prisma } from "@/generated/prisma";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import {
  attachCampaignProgress,
  createDonationCampaignWithPlaceImage,
} from "@/libs/donations";
import {
  getCampaignStatusFilter,
  getFormString,
  getOptionalFormFile,
  mapDonationServiceError,
  serializeCampaign,
} from "@/libs/donations/adminApi";
import { revalidateDonationCampaignViews } from "@/libs/cache/revalidation";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";


const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

async function withDonationCounts<TCampaign extends { id: number }>(
  campaign: TCampaign,
) {
  const counts = await prisma.donation.groupBy({
    by: ["status"],
    where: { campaignId: campaign.id },
    _count: { _all: true },
  });

  return {
    ...campaign,
    donationCounts: Object.fromEntries(
      counts.map((count) => [count.status, count._count._all]),
    ),
  };
}

export async function GET(request: NextRequest) {
  await ensureRequestTimeRendering();

  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );
    const skip = (page - 1) * pageSize;
    const status = getCampaignStatusFilter(searchParams.get("status"));
    const search = searchParams.get("search")?.trim();

    const where: Prisma.DonationCampaignWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { institutionName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { locality: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { address: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [campaigns, totalCampaigns] = await prisma.$transaction([
      prisma.donationCampaign.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.donationCampaign.count({ where }),
    ]);

    const serializedCampaigns = await Promise.all(
      campaigns.map(async (campaign) =>
        serializeCampaign(await withDonationCounts(await attachCampaignProgress(campaign))),
      ),
    );

    return NextResponse.json({
      campaigns: serializedCampaigns,
      totalCampaigns,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCampaigns / pageSize),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/donation-campaigns:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const formData = await request.formData();
    const placeImage = getOptionalFormFile(formData, "placeImage");

    if (!placeImage) {
      return NextResponse.json(
        {
          message: "Datos invalidos",
          errors: { placeImage: "La imagen del lugar es obligatoria" },
          success: false,
        },
        { status: 400 },
      );
    }

    const campaign = await createDonationCampaignWithPlaceImage(
      {
        institutionName: getFormString(formData, "institutionName"),
        locality: getFormString(formData, "locality"),
        address: getFormString(formData, "address"),
        goalAmount: getFormString(formData, "goalAmount"),
      },
      placeImage,
    );

    revalidateDonationCampaignViews(campaign.id);

    return NextResponse.json(
      {
        message: "Campana creada correctamente",
        campaign: serializeCampaign(await attachCampaignProgress(campaign)),
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    const serviceResponse = mapDonationServiceError(error);
    if (serviceResponse) return serviceResponse;

    console.error("Error in POST /api/admin/donation-campaigns:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
