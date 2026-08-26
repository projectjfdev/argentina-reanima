import { Prisma } from "@/generated/prisma";
import { prisma } from "@/libs/db";
import { generateNextCertificateSerialNumbers } from "./generateCertificateSerialNumber";
import { generateUniqueCertificatePublicIds } from "./generateUniqueCertificatePublicId";
import { normalizeCertificateEmail } from "./normalizeCertificateEmail";
import type { CertificateTemplateKey } from "./certificateTemplates";
import type { ValidCertificateImportRow } from "./validateCertificateImportRows";

export type BulkCertificateSharedData = {
  certificateText: string;
  footerText: string;
  templateKey: CertificateTemplateKey;
  instructorSignatureEnabled: boolean;
  instructorKey: string | null;
  expiresAt: Date | null;
};

type BulkCertificateUser = {
  id: number;
  name: string;
  email: string;
};

const createdCertificateSelect = {
  id: true,
  publicId: true,
  recipientName: true,
  recipientEmail: true,
  recipientEmailNormalized: true,
  recipientDni: true,
  certificateText: true,
  footerText: true,
  serialNumber: true,
  templateKey: true,
  instructorSignatureEnabled: true,
  instructorKey: true,
  status: true,
  userId: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.CertificateSelectCreateManyAndReturn;

type CreatedBulkCertificate = Prisma.CertificateGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

type CreatedBulkCertificateWithoutUser = Prisma.CertificateGetPayload<{
  select: typeof createdCertificateSelect;
}>;

type BulkCertificateClient = {
  user: {
    findMany: typeof prisma.user.findMany;
  };
  $transaction: typeof prisma.$transaction;
};

function attachUsersToCertificates(
  certificates: CreatedBulkCertificateWithoutUser[],
  usersById: Map<number, BulkCertificateUser>,
  serialNumberOrder: Map<string, number>,
): CreatedBulkCertificate[] {
  const certificatesWithUsers: CreatedBulkCertificate[] = certificates.map(
    (certificate) => ({
      ...certificate,
      user: certificate.userId
        ? usersById.get(certificate.userId) ?? null
        : null,
    }),
  );

  return certificatesWithUsers.sort(
    (left, right) =>
      (serialNumberOrder.get(left.serialNumber) ?? 0) -
      (serialNumberOrder.get(right.serialNumber) ?? 0),
  );
}

export async function createCertificatesFromRows(
  rows: ValidCertificateImportRow[],
  sharedData: BulkCertificateSharedData,
  client: BulkCertificateClient = prisma,
) {
  const normalizedEmails = Array.from(
    new Set(rows.map((row) => row.recipientEmailNormalized)),
  );
  const users = await client.user.findMany({
    where: {
      email: {
        in: normalizedEmails,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  const usersByEmail = new Map(
    users.map((user) => [normalizeCertificateEmail(user.email), user]),
  );
  const usersById = new Map(users.map((user) => [user.id, user]));
  const publicIds = generateUniqueCertificatePublicIds(rows.length);

  return client.$transaction(async (tx) => {
    const serialNumbers = await generateNextCertificateSerialNumbers(
      tx,
      rows.length,
    );
    const serialNumberOrder = new Map(
      serialNumbers.map((serialNumber, index) => [serialNumber, index]),
    );
    const data = rows.map((row, index) => {
      const user = usersByEmail.get(row.recipientEmailNormalized);

      return {
        publicId: publicIds[index],
        recipientName: row.recipientName,
        recipientEmail: row.recipientEmail,
        recipientEmailNormalized: row.recipientEmailNormalized,
        recipientDni: null,
        certificateText: sharedData.certificateText,
        footerText: sharedData.footerText,
        templateKey: sharedData.templateKey,
        serialNumber: serialNumbers[index],
        instructorSignatureEnabled: sharedData.instructorSignatureEnabled,
        instructorKey: sharedData.instructorKey,
        expiresAt: sharedData.expiresAt,
        userId: user?.id ?? null,
      };
    });
    const certificates = await tx.certificate.createManyAndReturn({
      data,
      select: createdCertificateSelect,
    });

    return {
      certificates: attachUsersToCertificates(
        certificates,
        usersById,
        serialNumberOrder,
      ),
      serialNumbers,
    };
  });
}
