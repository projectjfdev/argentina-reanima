import { CertificateStatus, Prisma } from "@/generated/prisma";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import {
  generateNextCertificateSerialNumbers,
  generateUniqueCertificatePublicId,
  getPublicCertificateUrl,
  validateCertificatePayload,
} from "@/libs/certificates";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PAGE_SIZE = 10;

function getStatusFilter(status: string | null): CertificateStatus | undefined {
  if (status === CertificateStatus.ACTIVE) return CertificateStatus.ACTIVE;
  if (status === CertificateStatus.DELETED) return CertificateStatus.DELETED;
  return undefined;
}

function buildCertificateWhere(
  searchParams: URLSearchParams,
): Prisma.CertificateWhereInput {
  const search = searchParams.get("search")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();
  const dni = searchParams.get("dni")?.trim();
  const serialNumber = searchParams.get("serialNumber")?.trim();
  const status = getStatusFilter(searchParams.get("status"));

  return {
    ...(status && { status }),
    ...(email && { recipientEmailNormalized: email }),
    ...(dni && { recipientDni: { contains: dni } }),
    ...(serialNumber && { serialNumber: { contains: serialNumber } }),
    ...(search && {
      OR: [
        {
          recipientName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          recipientEmail: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          recipientDni: {
            contains: search,
          },
        },
        {
          certificateText: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          footerText: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          serialNumber: {
            contains: search,
          },
        },
      ],
    }),
  };
}

function serializeCertificate<
  T extends { publicId: string; createdAt: Date; updatedAt: Date },
>(certificate: T) {
  return {
    ...certificate,
    createdAt: certificate.createdAt.toISOString(),
    updatedAt: certificate.updatedAt.toISOString(),
    publicUrl: getPublicCertificateUrl(certificate.publicId),
  };
}

function isUniqueConstraintError(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  return (
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes(field)
  );
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1),
      50,
    );
    const skip = (page - 1) * pageSize;
    const where = buildCertificateWhere(searchParams);

    const [certificates, totalCertificates] = await prisma.$transaction([
      prisma.certificate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.certificate.count({ where }),
    ]);

    return NextResponse.json({
      message: "Certificados obtenidos correctamente",
      certificates: certificates.map(serializeCertificate),
      totalCertificates,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCertificates / pageSize),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/certificates:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const validation = validateCertificatePayload(await request.json());

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Datos de certificado invalidos",
          errors: validation.errors,
          success: false,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: validation.data.recipientEmailNormalized },
      select: { id: true },
    });

    const certificate = await prisma.$transaction(async (tx) => {
      const publicId = await generateUniqueCertificatePublicId(tx);
      const [serialNumber] = await generateNextCertificateSerialNumbers(tx, 1);

      return tx.certificate.create({
        data: {
          ...validation.data,
          publicId,
          serialNumber,
          userId: user?.id ?? null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Certificado creado correctamente",
        certificate: serializeCertificate(certificate),
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/certificates:", error);

    if (isUniqueConstraintError(error, "serialNumber")) {
      return NextResponse.json(
        { message: "El numero de serie ya existe", success: false },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
