import { validateCertificateImportRows } from "@/libs/certificates/validateCertificateImportRows";
import { describe, expect, it } from "vitest";

describe("validateCertificateImportRows", () => {
  it("accepts rows with name and valid email", () => {
    const result = validateCertificateImportRows([
      {
        rowNumber: 2,
        recipientName: "Ana Perez",
        recipientEmail: "ANA@Example.com ",
      },
    ]);

    expect(result.errors).toEqual([]);
    expect(result.validRows).toEqual([
      {
        rowNumber: 2,
        recipientName: "Ana Perez",
        recipientEmail: "ANA@Example.com",
        recipientEmailNormalized: "ana@example.com",
      },
    ]);
  });

  it("reports missing and invalid row values", () => {
    const result = validateCertificateImportRows([
      {
        rowNumber: 3,
        recipientName: "",
        recipientEmail: "",
      },
      {
        rowNumber: 4,
        recipientName: "Luis Gomez",
        recipientEmail: "email-invalido",
      },
    ]);

    expect(result.validRows).toEqual([]);
    expect(result.errors).toEqual([
      {
        rowNumber: 3,
        field: "Nombre",
        message: "El nombre es obligatorio",
      },
      {
        rowNumber: 3,
        field: "Email",
        message: "El email es obligatorio",
      },
      {
        rowNumber: 4,
        field: "Email",
        message: "El email no es valido",
      },
    ]);
  });
});
