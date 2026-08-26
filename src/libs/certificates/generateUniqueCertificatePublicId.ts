import { Prisma } from "@/generated/prisma";
import { generateCertificatePublicId } from "./generateCertificatePublicId";

const MAX_PUBLIC_ID_ATTEMPTS = 5;

type CertificatePublicIdClient = Pick<Prisma.TransactionClient, "certificate">;

export function generateUniqueCertificatePublicIds(count: number): string[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("La cantidad de publicIds debe ser mayor a cero");
  }

  const publicIds: string[] = [];
  const reservedPublicIds = new Set<string>();
  const maxAttempts = count * MAX_PUBLIC_ID_ATTEMPTS;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const publicId = generateCertificatePublicId();

    if (reservedPublicIds.has(publicId)) {
      continue;
    }

    reservedPublicIds.add(publicId);
    publicIds.push(publicId);

    if (publicIds.length === count) {
      return publicIds;
    }
  }

  throw new Error("No se pudieron generar publicIds unicos");
}

export async function generateUniqueCertificatePublicId(
  client: CertificatePublicIdClient,
  reservedPublicIds = new Set<string>(),
): Promise<string> {
  for (let attempt = 0; attempt < MAX_PUBLIC_ID_ATTEMPTS; attempt += 1) {
    const publicId = generateCertificatePublicId();

    if (reservedPublicIds.has(publicId)) {
      continue;
    }

    const existingCertificate = await client.certificate.findUnique({
      where: { publicId },
      select: { id: true },
    });

    if (!existingCertificate) {
      reservedPublicIds.add(publicId);
      return publicId;
    }
  }

  throw new Error("No se pudo generar un publicId unico");
}
