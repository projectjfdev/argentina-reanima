import { DonationStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import {
  decimalToString,
  getRouteId,
  isValidRouteId,
  type RouteContextWithId,
} from "@/libs/donations/adminApi";
import { prisma } from "@/libs/db";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

const EXPORT_STATUS = DonationStatus.APPROVED;

function getDonorExportName(donation: {
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
}) {
  if (donation.isAnonymous) return { firstName: "", lastName: "" };

  return {
    firstName: donation.firstName ?? "",
    lastName: donation.lastName ?? "",
  };
}

function getDateForFilename(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function slugifyFilenamePart(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "campana";
}

function formatExportDate(value: Date | null) {
  return value ? value.toISOString() : "";
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

    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        institutionName: true,
        locality: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { message: "Campana no encontrada", success: false },
        { status: 404 },
      );
    }

    const donations = await prisma.donation.findMany({
      where: {
        campaignId,
        status: EXPORT_STATUS,
      },
      orderBy: [{ reviewedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        amount: true,
        isAnonymous: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    if (donations.length === 0) {
      return NextResponse.json(
        {
          message:
            "No hay donaciones aprobadas para exportar en esta campana.",
          success: false,
        },
        { status: 404 },
      );
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Argentina Reanima";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Donantes aprobados");
    worksheet.columns = [
      { header: "ID donacion", key: "id", width: 12 },
      { header: "Nombre", key: "firstName", width: 24 },
      { header: "Apellido", key: "lastName", width: 24 },
      { header: "Email", key: "email", width: 34 },
      { header: "Monto aprobado", key: "amount", width: 18 },
      { header: "Fecha donacion", key: "createdAt", width: 24 },
      { header: "Fecha aprobacion", key: "reviewedAt", width: 24 },
      { header: "Estado", key: "status", width: 16 },
      { header: "Visibilidad", key: "visibility", width: 16 },
      { header: "Campana ID", key: "campaignId", width: 12 },
      { header: "Campana", key: "campaignName", width: 34 },
      { header: "Localidad", key: "locality", width: 24 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: "middle" };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: "A1",
      to: "L1",
    };

    for (const donation of donations) {
      const donorName = getDonorExportName(donation);
      const amountValue = decimalToString(donation.amount);
      const amount = amountValue ? Number(amountValue) : null;

      worksheet.addRow({
        id: donation.id,
        firstName: donorName.firstName,
        lastName: donorName.lastName,
        email: donation.email ?? "",
        amount: amount !== null && Number.isFinite(amount) ? amount : "",
        createdAt: formatExportDate(donation.createdAt),
        reviewedAt: formatExportDate(donation.reviewedAt),
        status: "Aprobada",
        visibility: donation.isAnonymous ? "Anonima" : "Publica",
        campaignId: campaign.id,
        campaignName: campaign.institutionName,
        locality: campaign.locality,
      });
    }

    worksheet.getColumn("amount").numFmt = '"$"#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `donantes-campana-${slugifyFilenamePart(
      campaign.institutionName,
    )}-${campaign.id}-${getDateForFilename()}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Error in GET /api/admin/donation-campaigns/[id]/donors-export:",
      error,
    );
    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
