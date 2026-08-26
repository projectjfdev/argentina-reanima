import { POST } from "@/app/api/certificates/bulk/route";
import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { createCertificatesFromRows } from "@/libs/certificates/createCertificatesFromRows";
import ExcelJS from "exceljs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/libs/auth/requireAdminSession", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/libs/certificates/createCertificatesFromRows", () => ({
  createCertificatesFromRows: vi.fn(),
}));

const requireAdminSessionMock = vi.mocked(requireAdminSession);
const createCertificatesFromRowsMock = vi.mocked(createCertificatesFromRows);

async function createExcelFile(rows: Array<[string, string]>) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Certificados");

  worksheet.addRow(["Email", "Nombre"]);
  rows.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();

  return new File([buffer as BlobPart], "certificados.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

async function createBulkRequest(rows: Array<[string, string]>) {
  const formData = new FormData();

  formData.set("file", await createExcelFile(rows));

  return {
    formData: async () => formData,
  } as Request;
}

describe("POST /api/certificates/bulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue(null);
  });

  it("ignores Excel rows where email and name are both empty", async () => {
    const response = await POST(
      await createBulkRequest([
        ["ana@example.com", "Ana Perez"],
        ["", ""],
      ]),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      rowCount: 1,
      validRowCount: 1,
      errorCount: 0,
      success: true,
    });
    expect(body.previewRows).toEqual([
      {
        rowNumber: 2,
        recipientEmail: "ana@example.com",
        recipientEmailNormalized: "ana@example.com",
        recipientName: "Ana Perez",
      },
    ]);
    expect(createCertificatesFromRowsMock).not.toHaveBeenCalled();
  });

  it("trims whitespace before validating and ignores whitespace-only rows", async () => {
    const response = await POST(
      await createBulkRequest([
        ["  ana@example.com  ", "  Ana Perez  "],
        ["   ", "   "],
      ]),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      rowCount: 1,
      validRowCount: 1,
      errorCount: 0,
      success: true,
    });
    expect(body.previewRows[0]).toMatchObject({
      recipientEmail: "ana@example.com",
      recipientName: "Ana Perez",
    });
  });

  it("keeps partially complete rows so validation returns field errors", async () => {
    const response = await POST(
      await createBulkRequest([
        ["luis@example.com", ""],
        ["", "Maria Gomez"],
      ]),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      rowCount: 2,
      validRowCount: 0,
      errorCount: 2,
      success: false,
    });
    expect(body.errors).toEqual([
      {
        rowNumber: 2,
        field: "Nombre",
        message: "El nombre es obligatorio",
      },
      {
        rowNumber: 3,
        field: "Email",
        message: "El email es obligatorio",
      },
    ]);
  });
});
