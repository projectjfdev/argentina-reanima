const CERTIFICATE_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseCertificateDateInput(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;

  const dateValue = value.trim();
  if (!dateValue) return null;
  if (!CERTIFICATE_DATE_REGEX.test(dateValue)) return null;

  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isCertificateDateInput(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== "string") return false;
  if (!value.trim()) return true;

  return parseCertificateDateInput(value) !== null;
}

export function getCertificateDateInputValue(
  value: Date | string | null | undefined,
): string {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export function formatCertificateDate(
  value: Date | string | null | undefined,
): string {
  const inputValue = getCertificateDateInputValue(value);
  if (!CERTIFICATE_DATE_REGEX.test(inputValue)) return "";

  const [year, month, day] = inputValue.split("-");
  return `${day}/${month}/${year}`;
}

export function formatCertificateLongDate(
  value: Date | string | null | undefined,
): string {
  const inputValue = getCertificateDateInputValue(value);
  const date = parseCertificateDateInput(inputValue);
  if (!date) return "";

  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);

  return formattedDate.replace(
    / de ([a-záéíóúñ]+) de /i,
    (_match, monthName: string) =>
      ` de ${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de `,
  );
}
