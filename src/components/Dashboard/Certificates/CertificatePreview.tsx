"use client";

import {
  CERTIFICATE_PRESIDENT_SIGNATURE,
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
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
};

type CertificatePreviewProps = {
  data: CertificatePreviewData;
  className?: string;
};

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
>(function CertificatePreview({ data, className }, ref) {
  const [qrDataUrl, setQrDataUrl] = useState(data.qrDataUrl || "");
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
    <div className={cn("w-full", className)}>
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm"
        style={{
          aspectRatio: `${CERTIFICATE_CANVAS.width} / ${CERTIFICATE_CANVAS.height}`,
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
            fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.title.fontSize,
            lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.title.lineHeight,
            letterSpacing: CERTIFICATE_PREVIEW_TEXT_STYLE.title.letterSpacing,
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
            fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.certificateText.fontSize,
            lineHeight:
              CERTIFICATE_PREVIEW_TEXT_STYLE.certificateText.lineHeight,
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
            fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.footerText.fontSize,
            lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.footerText.lineHeight,
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
              }}
            >
              <p
                style={{
                  fontSize:
                    CERTIFICATE_PREVIEW_TEXT_STYLE.signatureName.fontSize,
                  lineHeight:
                    CERTIFICATE_PREVIEW_TEXT_STYLE.signatureName.lineHeight,
                }}
              >
                {instructor.name}
              </p>
              <p
                className="font-normal"
                style={{
                  fontSize:
                    CERTIFICATE_PREVIEW_TEXT_STYLE.signatureRole.fontSize,
                  lineHeight:
                    CERTIFICATE_PREVIEW_TEXT_STYLE.signatureRole.lineHeight,
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
          }}
        >
          <p
            style={{
              fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.signatureName.fontSize,
              lineHeight:
                CERTIFICATE_PREVIEW_TEXT_STYLE.signatureName.lineHeight,
            }}
          >
            {CERTIFICATE_PRESIDENT_SIGNATURE.name}
          </p>
          <p
            className="font-normal"
            style={{
              fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.signatureRole.fontSize,
              lineHeight:
                CERTIFICATE_PREVIEW_TEXT_STYLE.signatureRole.lineHeight,
            }}
          >
            {CERTIFICATE_PRESIDENT_SIGNATURE.role}
          </p>
        </PreviewTextBlock>

        <div
          className="absolute flex aspect-square items-center justify-center border border-neutral-500 bg-white p-1 text-center text-[clamp(5px,0.8vw,10px)] font-medium leading-tight text-neutral-700"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.qr.leftPercent}%`,
            top: `${CERTIFICATE_DYNAMIC_LAYOUT.qr.topPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.qr.widthPercent}%`,
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
            fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.serialNumber.fontSize,
            lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.serialNumber.lineHeight,
          }}
        >
          Serie {data.serialNumber || "AR-0000"}
        </PreviewTextBlock>

        <PreviewTextBlock
          className="leading-tight text-center"
          style={{
            left: `${CERTIFICATE_DYNAMIC_LAYOUT.institutionalText.leftPercent}%`,
            bottom: `${CERTIFICATE_DYNAMIC_LAYOUT.institutionalText.bottomPercent}%`,
            width: `${CERTIFICATE_DYNAMIC_LAYOUT.institutionalText.widthPercent}%`,
          }}
        >
          <p
            className="font-medium text-blue-300/90"
            style={{
              fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.slogan.fontSize,
              lineHeight: CERTIFICATE_PREVIEW_TEXT_STYLE.slogan.lineHeight,
            }}
          >
            Solo bajamos los brazos para hacer RCP
          </p>
          <p
            className="font-bold text-neutral-800"
            style={{
              fontSize: CERTIFICATE_PREVIEW_TEXT_STYLE.organization.fontSize,
              lineHeight:
                CERTIFICATE_PREVIEW_TEXT_STYLE.organization.lineHeight,
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
