import { Prisma } from "@/generated/prisma";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import {
  getDonationStatusFilter,
  serializeDonation,
} from "@/libs/donations/adminApi";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
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
    const campaignIdParam = searchParams.get("campaignId");
    const campaignId = campaignIdParam ? Number(campaignIdParam) : undefined;
    const status = getDonationStatusFilter(searchParams.get("status"));
    const search = searchParams.get("search")?.trim();

    if (campaignIdParam && (!Number.isInteger(campaignId) || campaignId! <= 0)) {
      return NextResponse.json(
        { message: "Campana invalida", success: false },
        { status: 400 },
      );
    }

    const where: Prisma.DonationWhereInput = {
      ...(campaignId && { campaignId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search.toLowerCase(), mode: Prisma.QueryMode.insensitive } },
          {
            receiptOriginalName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [donations, totalDonations] = await prisma.$transaction([
      prisma.donation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json({
      donations: donations.map(serializeDonation),
      totalDonations,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalDonations / pageSize),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/donations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
