import { Prisma } from "@/generated/prisma";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import {
  generateNextCertificateSerialNumbers,
  generateUniqueCertificatePublicId,
  CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER,
  certificateTextHasRecipientNamePlaceholder,
  getCertificateInstructorByKey,
  getCertificateTemplateByKey,
  getPublicCertificateUrl,
  normalizeCertificateTemplateKey,
  normalizeCertificateEmail,
  type CertificateTemplateKey,
} from "@/libs/certificates";
import {
  validateCertificateImportRows,
  type CertificateImportRowInput,
  type ValidCertificateImportRow,
} from "@/libs/certificates/validateCertificateImportRows";
import { prisma } from "@/libs/db";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

const REQUIRED_COLUMNS = ["Email", "Nombre"] as const;
const MAX_PREVIEW_ROWS = 10;

type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];

type ParsedCertificateImport = {
  rows: CertificateImportRowInput[];
  validation: ReturnType<typeof validateCertificateImportRows>;
};

type BulkSharedPayloadValidationResult =
  | {
      success: true;
      data: {
        certificateText: string;
        footerText: string;
        templateKey: CertificateTemplateKey;
        instructorSignatureEnabled: boolean;
        instructorKey: string | null;
      };
    }
  | { success: false; errors: Record<string, string> };

function normalizeHeader(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((item) => item.text).join("");
    }
    if ("result" in value) return getCellText(value.result as ExcelJS.CellValue);
    if ("hyperlink" in value && "text" in value) {
      return typeof value.text === "string" ? value.text : "";
    }
    return "";
  }

  return String(value);
}

function getHeaderMap(headerRow: ExcelJS.Row): Map<RequiredColumn, number> {
  const headerMap = new Map<RequiredColumn, number>();

  headerRow.eachCell((cell, columnNumber) => {
    const header = normalizeHeader(getCellText(cell.value));

    for (const requiredColumn of REQUIRED_COLUMNS) {
      if (header === normalizeHeader(requiredColumn)) {
        headerMap.set(requiredColumn, columnNumber);
      }
    }
  });

  return headerMap;
}

function getTrimmedFormString(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getBooleanFormValue(formData: FormData, field: string): boolean {
  return formData.get(field) === "true";
}

function validateBulkSharedPayload(
  formData: FormData,
): BulkSharedPayloadValidationResult {
  const certificateText = getTrimmedFormString(formData, "certificateText");
  const footerText = getTrimmedFormString(formData, "footerText");
  const templateKey = normalizeCertificateTemplateKey(
    formData.get("templateKey"),
  );
  const instructorSignatureEnabled = getBooleanFormValue(
    formData,
    "instructorSignatureEnabled",
  );
  const instructorKey = getTrimmedFormString(formData, "instructorKey");
  const errors: Record<string, string> = {};

  if (!certificateText) {
    errors.certificateText = "El texto principal es obligatorio";
  } else if (!certificateTextHasRecipientNamePlaceholder(certificateText)) {
    errors.certificateText = `El texto principal debe incluir ${CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER} para insertar el nombre automaticamente`;
  }

  if (!footerText) {
    errors.footerText = "El texto inferior es obligatorio";
  }

  if (!getCertificateTemplateByKey(templateKey)) {
    errors.templateKey = "La plantilla seleccionada no es valida";
  }

  if (
    instructorSignatureEnabled &&
    !getCertificateInstructorByKey(instructorKey)
  ) {
    errors.instructorKey = "El instructor seleccionado no es valido";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      certificateText,
      footerText,
      templateKey: templateKey as CertificateTemplateKey,
      instructorSignatureEnabled,
      instructorKey: instructorSignatureEnabled ? instructorKey : null,
    },
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

async function parseCertificateImportFile(
  file: File,
): Promise<ParsedCertificateImport | NextResponse> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json(
      {
        message: "El formato soportado es .xlsx",
        success: false,
      },
      { status: 400 },
    );
  }

  const workbook = new ExcelJS.Workbook();
  const fileBuffer = Buffer.from(await file.arrayBuffer()) as unknown as Parameters<
    typeof workbook.xlsx.load
  >[0];
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return NextResponse.json(
      {
        message: "El archivo no contiene hojas para validar",
        success: false,
      },
      { status: 400 },
    );
  }

  const headerMap = getHeaderMap(worksheet.getRow(1));
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headerMap.has(column),
  );

  if (missingColumns.length > 0) {
    return NextResponse.json(
      {
        message: "Faltan columnas obligatorias",
        missingColumns,
        success: false,
      },
      { status: 400 },
    );
  }

  const rows: CertificateImportRowInput[] = [];
  const emailColumn = headerMap.get("Email");
  const nameColumn = headerMap.get("Nombre");

  if (!emailColumn || !nameColumn) {
    return NextResponse.json(
      {
        message: "Faltan columnas obligatorias",
        missingColumns: REQUIRED_COLUMNS,
        success: false,
      },
      { status: 400 },
    );
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    rows.push({
      rowNumber,
      recipientEmail: getCellText(row.getCell(emailColumn).value),
      recipientName: getCellText(row.getCell(nameColumn).value),
    });
  });

  return {
    rows,
    validation: validateCertificateImportRows(rows),
  };
}

function buildValidationResponse(importData: ParsedCertificateImport) {
  const responseStatus = importData.validation.errors.length > 0 ? 400 : 200;

  return NextResponse.json(
    {
      message:
        importData.validation.errors.length > 0
          ? "El archivo contiene filas con errores"
          : "Archivo validado correctamente",
      rowCount: importData.rows.length,
      validRowCount: importData.validation.validRows.length,
      errorCount: importData.validation.errors.length,
      errors: importData.validation.errors,
      previewRows: importData.validation.validRows.slice(0, MAX_PREVIEW_ROWS),
      success: importData.validation.errors.length === 0,
    },
    { status: responseStatus },
  );
}

async function createCertificatesFromRows(
  rows: ValidCertificateImportRow[],
  sharedData: BulkSharedPayloadValidationResult & { success: true },
) {
  const normalizedEmails = Array.from(
    new Set(rows.map((row) => row.recipientEmailNormalized)),
  );
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: normalizedEmails,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });
  const usersByEmail = new Map(
    users.map((user) => [normalizeCertificateEmail(user.email), user]),
  );

  return prisma.$transaction(async (tx) => {
    const serialNumbers = await generateNextCertificateSerialNumbers(
      tx,
      rows.length,
    );
    const reservedPublicIds = new Set<string>();
    const certificates = [];

    for (const [index, row] of rows.entries()) {
      const publicId = await generateUniqueCertificatePublicId(
        tx,
        reservedPublicIds,
      );
      const user = usersByEmail.get(row.recipientEmailNormalized);

      certificates.push(
        await tx.certificate.create({
          data: {
            publicId,
            recipientName: row.recipientName,
            recipientEmail: row.recipientEmail,
            recipientEmailNormalized: row.recipientEmailNormalized,
            recipientDni: null,
            certificateText: sharedData.data.certificateText,
            footerText: sharedData.data.footerText,
            templateKey: sharedData.data.templateKey,
            serialNumber: serialNumbers[index],
            instructorSignatureEnabled:
              sharedData.data.instructorSignatureEnabled,
            instructorKey: sharedData.data.instructorKey,
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
        }),
      );
    }

    return {
      certificates,
      serialNumbers,
    };
  });
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file");
    const shouldCreate = formData.get("intent") === "create";

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "El archivo Excel es obligatorio",
          success: false,
        },
        { status: 400 },
      );
    }

    const importData = await parseCertificateImportFile(file);
    if (importData instanceof NextResponse) {
      return importData;
    }

    if (!shouldCreate) {
      return buildValidationResponse(importData);
    }

    const sharedPayload = validateBulkSharedPayload(formData);

    if (!sharedPayload.success) {
      return NextResponse.json(
        {
          message: "Datos de certificado invalidos",
          errors: sharedPayload.errors,
          success: false,
        },
        { status: 400 },
      );
    }

    if (importData.validation.errors.length > 0) {
      return buildValidationResponse(importData);
    }

    if (importData.validation.validRows.length === 0) {
      return NextResponse.json(
        {
          message: "El archivo no contiene filas validas para crear",
          success: false,
        },
        { status: 400 },
      );
    }

    const { certificates, serialNumbers } = await createCertificatesFromRows(
      importData.validation.validRows,
      sharedPayload,
    );

    return NextResponse.json(
      {
        message: "Certificados creados correctamente",
        createdCount: certificates.length,
        serialRange: {
          from: serialNumbers[0],
          to: serialNumbers[serialNumbers.length - 1],
        },
        certificates: certificates.map(serializeCertificate),
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/certificates/bulk:", error);

    if (isUniqueConstraintError(error, "serialNumber")) {
      return NextResponse.json(
        { message: "El numero de serie ya existe", success: false },
        { status: 409 },
      );
    }

    if (isUniqueConstraintError(error, "publicId")) {
      return NextResponse.json(
        { message: "No se pudo generar un identificador unico", success: false },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
