import { authOptions } from "@/libs/authOptions";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import { normalizeCertificateEmail } from "@/libs/certificates";
import { prisma } from "@/libs/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function buildCertificateOwnerFilter(email?: string | null, id?: string) {
  const filters = [];
  const normalizedEmail = email ? normalizeCertificateEmail(email) : "";
  const userId = Number(id);

  if (normalizedEmail) {
    filters.push({ recipientEmailNormalized: normalizedEmail });
  }

  if (Number.isInteger(userId) && userId > 0) {
    filters.push({ userId });
  }

  return filters;
}

export async function GET() {
  await ensureRequestTimeRendering();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "No autenticado", success: false },
        { status: 401 },
      );
    }

    const ownerFilters = buildCertificateOwnerFilter(
      session.user.email,
      session.user.id,
    );

    if (ownerFilters.length === 0) {
      return NextResponse.json({
        message: "Certificados obtenidos correctamente",
        certificates: [],
        success: true,
      });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        status: "ACTIVE",
        OR: ownerFilters,
      },
      select: {
        publicId: true,
        recipientName: true,
        certificateText: true,
        footerText: true,
        templateKey: true,
        serialNumber: true,
        instructorSignatureEnabled: true,
        instructorKey: true,
        expiresAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Certificados obtenidos correctamente",
      certificates: certificates.map((certificate) => ({
        ...certificate,
        expiresAt: certificate.expiresAt?.toISOString() ?? null,
      })),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/me/certificates:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
