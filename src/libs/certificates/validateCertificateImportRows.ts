import { normalizeCertificateEmail } from "./normalizeCertificateEmail";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CertificateImportRowInput = {
  rowNumber: number;
  recipientName: string;
  recipientEmail: string;
};

export type ValidCertificateImportRow = {
  rowNumber: number;
  recipientName: string;
  recipientEmail: string;
  recipientEmailNormalized: string;
};

export type CertificateImportRowError = {
  rowNumber: number;
  field: "Nombre" | "Email";
  message: string;
};

export type CertificateImportValidationResult = {
  validRows: ValidCertificateImportRow[];
  errors: CertificateImportRowError[];
};

export function validateCertificateImportRows(
  rows: CertificateImportRowInput[],
): CertificateImportValidationResult {
  const validRows: ValidCertificateImportRow[] = [];
  const errors: CertificateImportRowError[] = [];

  for (const row of rows) {
    const recipientName = row.recipientName.trim();
    const recipientEmail = row.recipientEmail.trim();
    const recipientEmailNormalized = normalizeCertificateEmail(recipientEmail);
    let hasError = false;

    if (!recipientName) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "Nombre",
        message: "El nombre es obligatorio",
      });
      hasError = true;
    }

    if (!recipientEmail) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "Email",
        message: "El email es obligatorio",
      });
      hasError = true;
    } else if (!EMAIL_REGEX.test(recipientEmailNormalized)) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "Email",
        message: "El email no es valido",
      });
      hasError = true;
    }

    if (!hasError) {
      validRows.push({
        rowNumber: row.rowNumber,
        recipientName,
        recipientEmail,
        recipientEmailNormalized,
      });
    }
  }

  return { validRows, errors };
}
