import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import {
  getPublicCertificateUrl,
  validateCertificatePayload,
} from "@/libs/certificates";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

type CertificateRouteContext = {
  params: Promise<{ publicId: string }> | { publicId: string };
};

async function getPublicId(context: CertificateRouteContext): Promise<string> {
  const params = await context.params;
  return params.publicId;
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

export async function GET(
  _request: NextRequest,
  context: CertificateRouteContext,
) {
  await ensureRequestTimeRendering();

  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const publicId = await getPublicId(context);

    const certificate = await prisma.certificate.findUnique({
      where: { publicId },
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

    if (!certificate) {
      return NextResponse.json(
        { message: "Certificado no encontrado", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Certificado obtenido correctamente",
      certificate: serializeCertificate(certificate),
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/certificates/[publicId]:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: CertificateRouteContext,
) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const publicId = await getPublicId(context);
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

    const existingCertificate = await prisma.certificate.findUnique({
      where: { publicId },
      select: { id: true },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { message: "Certificado no encontrado", success: false },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: validation.data.recipientEmailNormalized },
      select: { id: true },
    });

    const certificate = await prisma.certificate.update({
      where: { publicId },
      data: {
        ...validation.data,
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

    return NextResponse.json({
      message: "Certificado actualizado correctamente",
      certificate: serializeCertificate(certificate),
      success: true,
    });
  } catch (error) {
    console.error("Error in PUT /api/certificates/[publicId]:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: CertificateRouteContext,
) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const publicId = await getPublicId(context);

    const existingCertificate = await prisma.certificate.findUnique({
      where: { publicId },
      select: { id: true },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { message: "Certificado no encontrado", success: false },
        { status: 404 },
      );
    }

    const certificate = await prisma.certificate.update({
      where: { publicId },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
        userId: null,
      },
    });

    return NextResponse.json({
      message: "Certificado eliminado correctamente",
      certificate: serializeCertificate(certificate),
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/certificates/[publicId]:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
