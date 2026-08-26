import { Prisma } from "@/generated/prisma";

const CERTIFICATE_SERIAL_PREFIX = "AR-";
const CERTIFICATE_SERIAL_PADDING = 4;
const CERTIFICATE_SERIAL_LOCK_KEY = 7142026;

type CertificateSerialClient = Pick<
  Prisma.TransactionClient,
  "$executeRaw" | "$queryRaw"
>;

export function formatCertificateSerialNumber(value: number): string {
  return `${CERTIFICATE_SERIAL_PREFIX}${value
    .toString()
    .padStart(CERTIFICATE_SERIAL_PADDING, "0")}`;
}

export async function generateNextCertificateSerialNumbers(
  client: CertificateSerialClient,
  count: number,
): Promise<string[]> {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("La cantidad de numeros de serie debe ser mayor a cero");
  }

  await client.$executeRaw`SELECT pg_advisory_xact_lock(${CERTIFICATE_SERIAL_LOCK_KEY})`;

  const [result] = await client.$queryRaw<{ maxSerialValue: number | bigint }[]>`
    SELECT COALESCE(MAX(CAST(SUBSTRING("serialNumber" FROM 4) AS INTEGER)), 0) AS "maxSerialValue"
    FROM "Certificate"
    WHERE "serialNumber" ~ '^AR-[0-9]+$'
  `;
  const maxSerialValue = Number(result?.maxSerialValue ?? 0);

  return Array.from({ length: count }, (_item, index) =>
    formatCertificateSerialNumber(maxSerialValue + index + 1),
  );
}

export async function generateNextCertificateSerialNumber(
  client: CertificateSerialClient,
): Promise<string> {
  const [serialNumber] = await generateNextCertificateSerialNumbers(client, 1);
  return serialNumber;
}
