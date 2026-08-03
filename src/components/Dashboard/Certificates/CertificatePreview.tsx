"use client";

import {
  CERTIFICATE_PRESIDENT_SIGNATURE,
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  formatCertificateLongDate,
  generateCertificateQrDataUrl,
  getCertificateInstructorByKey,
  getCertificateTemplateByKey,
  renderCertificateTextTemplate,
} from "@/libs/certificates";
import {
  CERTIFICATE_CANVAS,
  CERTIFICATE_DYNAMIC_LAYOUT,
  CERTIFICATE_PREVIEW_TEXT_STYLE,
} from "@/libs/certificates/certificateLayout";
import { cn } from "@/libs/utils";
import type React from "react";
import { forwardRef, useEffect, useState } from "react";

export type CertificatePreviewData = {
  recipientName?: string;
  recipientDni?: string | null;
  certificateText?: string;
  footerText?: string;
  templateKey?: string | null;
  serialNumber?: string;
  instructorSignatureEnabled?: boolean;
  instructorKey?: string | null;
  publicId?: string;
  publicUrl?: string;
  qrDataUrl?: string;
  expiresAt?: Date | string | null;
};

type CertificatePreviewProps = {
  data: CertificatePreviewData;
  className?: string;
  variant?: "preview" | "export";
};

const CERTIFICATE_SERIF_FONT = "var(--font-certificate-serif), Georgia, serif";
const CERTIFICATE_SANS_FONT = "var(--font-geist-sans), Arial, sans-serif";
const CERTIFICATE_EXPORT_TEXT_STYLE = {
  title: {
    fontSize: "40px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.title.lineHeight,
    letterSpacing: CERTIFICATE_PREVIEW_TEXT_STYLE.title.letterSpacing,
  },
  certificateText: {
    fontSize: "20px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.certificateText.lineHeight,
  },
  footerText: {
    fontSize: "15px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.footerText.lineHeight,
  },
  signatureName: {
    fontSize: "12px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.signatureName.lineHeight,
  },
  signatureRole: {
    fontSize: "14px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.signatureRole.lineHeight,
  },
  serialNumber: {
    fontSize: "15px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.serialNumber.lineHeight,
  },
  expirationText: {
    fontSize: "14px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.expirationText.lineHeight,
  },
  slogan: {
    fontSize: "26px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.slogan.lineHeight,
  },
  organization: {
    fontSize: "14px",
    lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.organization.lineHeight,
  },
} as const;

function PreviewTextBlock({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("absolute text-neutral-900", className)} style={style}>
      {children}
    </div>
  );
}

export const CertificatePreview = forwardRef<
  HTMLDivElement,
  CertificatePreviewProps
>(function CertificatePreview({ data, className, variant = "preview" }, ref) {
  const [qrDataUrl, setQrDataUrl] = useState(data.qrDataUrl || "");
  const isExportVariant = variant === "export";
  const textStyle = isExportVariant
    ? CERTIFICATE_EXPORT_TEXT_STYLE
    : CERTIFICATE_PREVIEW_TEXT_STYLE;
  const instructor = data.instructorSignatureEnabled
    ? getCertificateInstructorByKey(data.instructorKey)
    : undefined;
  const defaultTemplate = getCertificateTemplateByKey(
    DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  );
  const template =
    getCertificateTemplateByKey(data.templateKey) ?? defaultTemplate;
  const renderedCertificateText = data.certificateText
    ? renderCertificateTextTemplate(data.certificateText, data.recipientName)
    : "Se deja constancia que la persona destinataria ha participado de la actividad indicada por Argentina Reanima.";
  const expirationText = formatCertificateLongDate(data.expiresAt);

  useEffect(() => {
    let isMounted = true;

    if (!data.publicUrl) {
      setQrDataUrl(data.qrDataUrl || "");
      return;
    }

    generateCertificateQrDataUrl(data.publicUrl)
      .then((value) => {
        if (isMounted) {
          setQrDataUrl(value);
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrDataUrl("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [data.publicUrl, data.qrDataUrl]);

  return (
    <div
      className={cn(isExportVariant ? "block" : "w-full", className)}
      style={
        isExportVariant
          ? {
              width: CERTIFICATE_CANVAS.width,
              height: CERTIFICATE_CANVAS.height,
            }
          : undefined
      }
    >
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-white",
          isExportVariant
            ? "border-0 shadow-none"
            : "w-full rounded-md border border-neutral-200 shadow-sm",
        )}
        style={{
          aspectRatio: `${CERTIFICATE_CANVAS.width} / ${CERTIFICATE_CANVAS.height}`,
          ...(isExportVariant
            ? {
                width: CERTIFICATE_CANVAS.width,
                height: CERTIFICATE_CANVAS.height,
              }
            : undefined),
        }}
      >
        <img
          src={
            template?.imageSrc ??
            defaultTemplate?.imageSrc ??
            "/certificado-template/certificado-template_1.png"
          }
          alt={template?.name ?? "Plantilla de certificado"}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <PreviewTextBlock
          className="text-center font-medium"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.title.leftPercent}%`,
            top: `${CERTIFICATE_DYNAMIC_LAYOUT.title.topPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.title.widthPercent}%`,
            fontFamily: CERTIFICATE_SERIF_FONT,
            fontSize: textStyle.title.fontSize,
            lineHeight: textStyle.title.lineHeight,
            letterSpacing: textStyle.title.letterSpacing,
          }}
        >
          CERTIFICADO
        </PreviewTextBlock>

        <PreviewTextBlock
          className="whitespace-pre-line text-left font-medium"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.certificateText.leftPercent}%`,
            top: `${CERTIFICATE_DYNAMIC_LAYOUT.certificateText.topPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.certificateText.widthPercent}%`,
            fontFamily: CERTIFICATE_SERIF_FONT,
            fontSize: textStyle.certificateText.fontSize,
            lineHeight: textStyle.certificateText.lineHeight,
          }}
        >
          {renderedCertificateText}
        </PreviewTextBlock>

        <PreviewTextBlock
          className="whitespace-pre-line text-center font-medium text-neutral-800"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.footerText.leftPercent}%`,
            bottom: `${CERTIFICATE_DYNAMIC_LAYOUT.footerText.bottomPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.footerText.widthPercent}%`,
            fontFamily: CERTIFICATE_SERIF_FONT,
            fontSize: textStyle.footerText.fontSize,
            lineHeight: textStyle.footerText.lineHeight,
          }}
        >
          {data.footerText ||
            "Aclaracion inferior del certificado. Este texto debe mantenerse fuera de la zona de firma."}
        </PreviewTextBlock>

        {instructor && (
          <>
            <img
              src={instructor.imageSrc}
              alt={`Firma de ${instructor.name}`}
              className="absolute object-contain"
              style={{
                left: `${CERTIFICATE_DYNAMIC_LAYOUT.instructorSignature.leftPercent}%`,
                bottom: `${CERTIFICATE_DYNAMIC_LAYOUT.instructorSignature.bottomPercent}%`,
                width: `${CERTIFICATE_DYNAMIC_LAYOUT.instructorSignature.widthPercent}%`,
                height: `${CERTIFICATE_DYNAMIC_LAYOUT.instructorSignature.heightPercent}%`,
              }}
            />
            <PreviewTextBlock
              className="text-center font-medium leading-tight text-neutral-800"
              style={{
                left: `${CERTIFICATE_DYNAMIC_LAYOUT.instructorLabel.leftPercent}%`,
                bottom: `${CERTIFICATE_DYNAMIC_LAYOUT.instructorLabel.bottomPercent}%`,
                width: `${CERTIFICATE_DYNAMIC_LAYOUT.instructorLabel.widthPercent}%`,
                fontFamily: CERTIFICATE_SANS_FONT,
              }}
            >
              <p
                style={{
                  fontSize: textStyle.signatureName.fontSize,
                  lineHeight: textStyle.signatureName.lineHeight,
                }}
              >
                {instructor.name}
              </p>
              <p
                className="font-normal"
                style={{
                  fontSize: textStyle.signatureRole.fontSize,
                  lineHeight: textStyle.signatureRole.lineHeight,
                }}
              >
                Instructor
              </p>
            </PreviewTextBlock>
          </>
        )}

        <img
          src={CERTIFICATE_PRESIDENT_SIGNATURE.imageSrc}
          alt={`Firma de ${CERTIFICATE_PRESIDENT_SIGNATURE.name}`}
          className="absolute object-contain"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.presidentSignature.leftPercent}%`,
            bottom: `${CERTIFICATE_DYNAMIC_LAYOUT.presidentSignature.bottomPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.presidentSignature.widthPercent}%`,
            height: `${CERTIFICATE_DYNAMIC_LAYOUT.presidentSignature.heightPercent}%`,
          }}
        />
        <PreviewTextBlock
          className="text-center font-medium leading-tight text-neutral-800"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.presidentLabel.leftPercent}%`,
            bottom: `${CERTIFICATE_DYNAMIC_LAYOUT.presidentLabel.bottomPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.presidentLabel.widthPercent}%`,
            fontFamily: CERTIFICATE_SANS_FONT,
          }}
        >
          <p
            style={{
              fontSize: textStyle.signatureName.fontSize,
              lineHeight: textStyle.signatureName.lineHeight,
            }}
          >
            {CERTIFICATE_PRESIDENT_SIGNATURE.name}
          </p>
          <p
            className="font-normal"
            style={{
              fontSize: textStyle.signatureRole.fontSize,
              lineHeight: textStyle.signatureRole.lineHeight,
            }}
          >
            {CERTIFICATE_PRESIDENT_SIGNATURE.role}
          </p>
        </PreviewTextBlock>

        <div
          className="absolute flex aspect-square items-center justify-center border border-neutral-500 bg-white p-1 text-center font-medium leading-tight text-neutral-700"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.qr.leftPercent}%`,
            top: `${CERTIFICATE_DYNAMIC_LAYOUT.qr.topPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.qr.widthPercent}%`,
            fontFamily: CERTIFICATE_SANS_FONT,
            fontSize: textStyle.signatureRole.fontSize,
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR de validacion del certificado"
              className="h-full w-full object-contain"
            />
          ) : data.publicId ? (
            "Generando QR"
          ) : (
            "QR al guardar"
          )}
        </div>

        <PreviewTextBlock
          className="text-left font-medium text-neutral-700"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.serialNumber.leftPercent}%`,
            top: `${CERTIFICATE_DYNAMIC_LAYOUT.serialNumber.topPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.serialNumber.widthPercent}%`,
            fontFamily: CERTIFICATE_SANS_FONT,
            fontSize: textStyle.serialNumber.fontSize,
            lineHeight: textStyle.serialNumber.lineHeight,
          }}
        >
          Serie {data.serialNumber || "AR-0000"}
        </PreviewTextBlock>

        {expirationText && (
          <PreviewTextBlock
            className="text-right font-medium text-neutral-700"
            style={{
              left: `${CERTIFICATE_DYNAMIC_LAYOUT.expirationText.leftPercent}%`,
              top: `${CERTIFICATE_DYNAMIC_LAYOUT.expirationText.topPercent}%`,
              width: `${CERTIFICATE_DYNAMIC_LAYOUT.expirationText.widthPercent}%`,
              fontFamily: CERTIFICATE_SANS_FONT,
              fontSize: textStyle.expirationText.fontSize,
              lineHeight: textStyle.expirationText.lineHeight,
            }}
          >
            Validez del certificado hasta el {expirationText}.
          </PreviewTextBlock>
        )}

        <PreviewTextBlock
          className="leading-tight text-center"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.institutionalText.leftPercent}%`,
            bottom: `${CERTIFICATE_DYNAMIC_LAYOUT.institutionalText.bottomPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.institutionalText.widthPercent}%`,
            fontFamily: CERTIFICATE_SANS_FONT,
          }}
        >
          <p
            className="font-normal text-sky-300/75"
            style={{
              fontSize: textStyle.slogan.fontSize,
              lineHeight: textStyle.slogan.lineHeight,
            }}
          >
            Solo bajamos los brazos para hacer RCP
          </p>
          <p
            className="font-bold text-neutral-800"
            style={{
              fontSize: textStyle.organization.fontSize,
              lineHeight: textStyle.organization.lineHeight,
            }}
          >
            Asociación Civil Argentina Reanima - Matrícula N° 48.014
          </p>
        </PreviewTextBlock>
      </div>
    </div>
  );
});

CertificatePreview.displayName = "CertificatePreview";
