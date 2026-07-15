"use client";

import {
  CertificatePreview,
  type CertificatePreviewData,
} from "@/components/Dashboard/Certificates/CertificatePreview";
import { renderCertificateTextTemplate } from "@/libs/certificates";
import { exportCertificatePreviewToPng } from "@/libs/certificates/exportCertificatePreviewToPng";
import {
  Copy,
  CopyCheck,
  Download,
  Linkedin,
  MessageCircle,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Toaster, toast } from "sonner";

type CertificateValidationContentProps = {
  certificate: CertificatePreviewData & {
    recipientName: string;
    recipientDni: string | null;
    certificateText: string;
    serialNumber: string;
    publicId: string;
  };
};

export function CertificateValidationContent({
  certificate,
}: CertificateValidationContentProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const shareUrl = certificate.publicUrl || "";
  const renderedCertificateText = renderCertificateTextTemplate(
    certificate.certificateText,
    certificate.recipientName,
  );
  const shareText = `Mira mi certificado de Argentina Reanima: ${renderedCertificateText}`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedShareText = encodeURIComponent(shareText);
  const shareLinks = [
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
      icon: Linkedin,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(
        `${shareText} ${shareUrl}`,
      )}`,
      icon: MessageCircle,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedShareUrl}`,
      icon: Twitter,
    },
  ];

  const handleDownloadPng = async () => {
    if (!previewRef.current) return;

    try {
      setIsExporting(true);
      await exportCertificatePreviewToPng(
        previewRef.current,
        certificate.serialNumber,
      );
    } catch (error) {
      console.error("Error exporting certificate PNG:", error);
      toast.error("No se pudo descargar el PNG del certificado");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setHasCopiedLink(true);
      toast.success("Enlace copiado");
      window.setTimeout(() => setHasCopiedLink(false), 2000);
    } catch (error) {
      console.error("Error copying certificate link:", error);
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <CertificatePreview ref={previewRef} data={certificate} />
        </section>

        <aside className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Datos de validación</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Certificado emitido por Argentina Reanima.
          </p>

          <dl className="mt-5 grid gap-3 text-sm">
            <ValidationItem label="Nombre">
              {certificate.recipientName}
            </ValidationItem>
            {certificate.recipientDni && (
              <ValidationItem label="DNI">
                {certificate.recipientDni}
              </ValidationItem>
            )}
            <ValidationItem label="Certificación">
              {renderedCertificateText}
            </ValidationItem>
            <ValidationItem label="Número de serie">
              {certificate.serialNumber}
            </ValidationItem>
          </dl>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isExporting ? "Generando PNG..." : "Descargar PNG"}
          </button>

          <div className="mt-4 border-t border-neutral-200 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Compartir certificado
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {shareLinks.map((shareLink) => (
                <ShareLink
                  key={shareLink.label}
                  href={shareLink.href}
                  icon={shareLink.icon}
                  label={shareLink.label}
                />
              ))}

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition-[background-color,border-color,transform] duration-150 ease-out hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {hasCopiedLink ? (
                  <CopyCheck
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                Copiar enlace
              </button>
            </div>
          </div>
        </aside>
      </div>
      <Toaster />
    </>
  );
}

function ShareLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition-[background-color,border-color,transform] duration-150 ease-out hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}

function ValidationItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
