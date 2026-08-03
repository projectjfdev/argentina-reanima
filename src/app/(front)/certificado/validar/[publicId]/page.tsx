import { CertificateValidationContent } from "@/components/Dashboard/Certificates/CertificateValidationContent";
import {
  generateCertificateQrDataUrl,
  getPublicCertificateUrl,
} from "@/libs/certificates";
import { prisma } from "@/libs/db";
import { AlertTriangle, CheckCircle2, FileBadge } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

type ValidateCertificatePageProps = {
  params: Promise<{ publicId: string }> | { publicId: string };
};

async function getPublicId(params: ValidateCertificatePageProps["params"]) {
  const resolvedParams = await params;
  return resolvedParams.publicId;
}

export default function ValidateCertificatePage({
  params,
}: ValidateCertificatePageProps) {
  return (
    <Suspense fallback={<ValidateCertificateFallback />}>
      <ValidateCertificateContent params={params} />
    </Suspense>
  );
}

async function ValidateCertificateContent({
  params,
}: ValidateCertificatePageProps) {
  const publicId = await getPublicId(params);
  const certificate = await prisma.certificate.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      recipientName: true,
      recipientDni: true,
      certificateText: true,
      footerText: true,
      templateKey: true,
      serialNumber: true,
      instructorSignatureEnabled: true,
      instructorKey: true,
      expiresAt: true,
      status: true,
    },
  });

  if (!certificate) {
    notFound();
  }

  const publicUrl = getPublicCertificateUrl(certificate.publicId);
  const isDeleted = certificate.status === "DELETED";
  const qrDataUrl = isDeleted
    ? ""
    : await generateCertificateQrDataUrl(publicUrl);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-950 md:px-8">
      <div className="mx-auto flex w-full container flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-neutral-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <FileBadge className="h-4 w-4" />
              Validacion publica
            </div>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
              Certificado Argentina Reanima
            </h1>
          </div>

          <div
            className={
              isDeleted
                ? "inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                : "inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            }
          >
            {isDeleted ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isDeleted ? "Certificado desactivado" : "Certificado valido"}
          </div>
        </header>

        {isDeleted ? (
          <section className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-700">
              Certificado desactivado
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Este certificado existió, pero fue desactivado por Argentina
              Reanima. No se ofrece descarga ni QR activo para esta validación.
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <ValidationItem label="Numero de serie">
                {certificate.serialNumber}
              </ValidationItem>
              <ValidationItem label="Identificador publico">
                {certificate.publicId}
              </ValidationItem>
            </dl>
          </section>
        ) : (
          <CertificateValidationContent
            certificate={{
              ...certificate,
              expiresAt: certificate.expiresAt?.toISOString() ?? null,
              publicUrl,
              qrDataUrl,
            }}
          />
        )}
      </div>
    </main>
  );
}

function ValidationItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-neutral-950">{children}</dd>
    </div>
  );
}

function ValidateCertificateFallback() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-950 md:px-8">
      <div className="mx-auto flex w-full container flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-neutral-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <FileBadge className="h-4 w-4" />
              Validacion publica
            </div>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
              Certificado Argentina Reanima
            </h1>
          </div>
        </header>
        <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-600">
            Validando certificado...
          </p>
        </section>
      </div>
    </main>
  );
}
