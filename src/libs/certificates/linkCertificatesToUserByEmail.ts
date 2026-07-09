import { Prisma } from "@/generated/prisma";
import { normalizeCertificateEmail } from "./normalizeCertificateEmail";

type CertificateLinkClient = {
  certificate: {
    updateMany(
      args: Prisma.CertificateUpdateManyArgs,
    ): Promise<Prisma.BatchPayload>;
  };
};

export async function linkCertificatesToUserByEmail(
  client: CertificateLinkClient,
  userId: number,
  email: string,
): Promise<Prisma.BatchPayload> {
  const recipientEmailNormalized = normalizeCertificateEmail(email);

  return client.certificate.updateMany({
    where: {
      recipientEmailNormalized,
      userId: null,
      status: "ACTIVE",
    },
    data: {
      userId,
    },
  });
}
