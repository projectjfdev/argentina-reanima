import { Prisma } from "@/generated/prisma";
import { generateCertificatePublicId } from "./generateCertificatePublicId";

const MAX_PUBLIC_ID_ATTEMPTS = 5;

type CertificatePublicIdClient = Pick<Prisma.TransactionClient, "certificate">;

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
