import { getPublicCertificateUrl } from "@/libs/certificates";
import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

type ValidateCertificateContext = {
  params: Promise<{ publicId: string }> | { publicId: string };
};

async function getPublicId(context: ValidateCertificateContext) {
  const params = await context.params;
  return params.publicId;
}

export async function GET(
  _request: NextRequest,
  context: ValidateCertificateContext,
) {
  await ensureRequestTimeRendering();

  try {
    const publicId = await getPublicId(context);
    const certificate = await prisma.certificate.findUnique({
      where: { publicId },
      select: {
        publicId: true,
        recipientName: true,
        recipientDni: true,
        certificateText: true,
        footerText: true,
        templateKey: true,
        serialNumber: true,
        instructorSignatureEnabled: true,
        instructorKey: true,
        status: true,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { message: "Certificado no encontrado", success: false },
        { status: 404 },
      );
    }

    if (certificate.status === "DELETED") {
      return NextResponse.json(
        {
          message: "Certificado desactivado",
          certificate: {
            publicId: certificate.publicId,
            status: certificate.status,
            serialNumber: certificate.serialNumber,
          },
          success: false,
        },
        { status: 410 },
      );
    }

    return NextResponse.json({
      message: "Certificado valido",
      certificate: {
        ...certificate,
        publicUrl: getPublicCertificateUrl(certificate.publicId),
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in GET /api/certificates/validate/[publicId]:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
