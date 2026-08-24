"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/libs/utils";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  HeartHandshake,
  Loader2,
  MapPin,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

type PublicCampaign = {
  id: number;
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  additionalImageUrls: string[];
  invoiceImageUrls: string[];
  invoiceImageUrl: string | null;
  invoiceImageOriginalName: string | null;
  goalAmount: string;
  status: "ACTIVE" | "COMPLETED";
  completedAt: string | null;
  approvedTotal: string;
  directApprovedTotal: string;
  incomingTransferTotal: string;
  outgoingTransferAmount: string;
  hasIncomingTransfers: boolean;
  hasOutgoingTransfer: boolean;
  percentage: number;
  visualPercentage: number;
  canDonate: boolean;
};

type CampaignsResponse = {
  campaigns: PublicCampaign[];
  totalCampaigns: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  success: boolean;
};

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
});

function formatMoney(value: string) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? moneyFormatter.format(numericValue)
    : value;
}

function formatDate(value: string | null) {
  if (!value) return null;
  return dateFormatter.format(new Date(value));
}

function statusLabel(status: PublicCampaign["status"]) {
  return status === "ACTIVE" ? "Activa" : "Completada";
}

function statusClass(status: PublicCampaign["status"]) {
  return status === "ACTIVE"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-sky-200 bg-sky-50 text-sky-700";
}

export function DonationCampaignsPageContent() {
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PublicCampaign | null>(
    null,
  );
  const [selectedAdditionalImage, setSelectedAdditionalImage] = useState<{
    campaign: PublicCampaign;
    imageUrl: string;
    index: number;
  } | null>(null);

  const activeCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.status === "ACTIVE") ?? null,
    [campaigns],
  );

  const loadCampaigns = useCallback(async (pageToLoad = 1) => {
    const isFirstPage = pageToLoad === 1;
    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: String(pageToLoad),
        pageSize: "9",
      });
      const response = await fetch(
        `/api/donation-campaigns?${params.toString()}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as CampaignsResponse;

      if (!response.ok) {
        throw new Error("No se pudieron cargar las campañas");
      }

      setCampaigns((current) =>
        isFirstPage
          ? (data.campaigns ?? [])
          : [...current, ...(data.campaigns ?? [])],
      );
      setPage(pageToLoad);
      setTotalPages(Math.max(data.totalPages ?? 1, 1));
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las campañas DEA");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns(1);
  }, [loadCampaigns]);

  return (
    <main className="bg-white text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 pt-24 text-white">
        <div className="absolute inset-0">
          <Image
            src={activeCampaign?.placeImageUrl ?? "/images/4.jpeg"}
            alt="Campañas DEA Argentina Reanima"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/35" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto grid min-h-[62svh] gap-8 px-4 py-16 md:grid-cols-[1fr_380px] md:items-end md:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <HeartHandshake className="h-4 w-4 text-primary" />
              Quiero ser parte
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Comunidades que crean nuevas oportunidades
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              Conocé las campañas activas, acompañá cada proyecto y descubrí los
              espacios que, gracias al compromiso de todos, hoy están preparados
              para actuar.
            </p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-medium text-white/65">Campaña activa</p>
            <p className="mt-2 text-2xl font-semibold">
              {activeCampaign?.institutionName ?? "Sin campaña activa"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              {activeCampaign
                ? `${formatMoney(activeCampaign.approvedTotal)} recaudados de ${formatMoney(activeCampaign.goalAmount)}`
                : "Cuando haya una campaña activa, aparecerá primero en este listado."}
            </p>
            {activeCampaign?.hasIncomingTransfers && (
              <p className="mt-2 text-sm leading-6 text-white/70">
                Incluye {formatMoney(activeCampaign.incomingTransferTotal)}{" "}
                transferidos desde una campaña anterior.
              </p>
            )}
            {activeCampaign && (
              <Button asChild className="mt-5 bg-primary text-white">
                <Link href="/quiero-ser-parte">
                  Quiero ahora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Todas nuestras campañas
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">
              Activas e históricas
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando campañas...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <Target className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No hay campañas publicas para mostrar.
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              Cuando una campaña este activa o completada, aparecera en esta
              seccion.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onViewInvoice={() => setSelectedInvoice(campaign)}
                  onViewAdditionalImage={(imageUrl, index) =>
                    setSelectedAdditionalImage({ campaign, imageUrl, index })
                  }
                />
              ))}
            </div>

            {page < totalPages && (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => loadCampaigns(page + 1)}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Cargando..." : "Ver mas campañas"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
      <InvoiceDialog
        campaign={selectedInvoice}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoice(null);
        }}
      />
      <AdditionalImageDialog
        selectedImage={selectedAdditionalImage}
        onOpenChange={(open) => {
          if (!open) setSelectedAdditionalImage(null);
        }}
      />
      <Toaster />
    </main>
  );
}

function CampaignCard({
  campaign,
  onViewInvoice,
  onViewAdditionalImage,
}: {
  campaign: PublicCampaign;
  onViewInvoice: () => void;
  onViewAdditionalImage: (imageUrl: string, index: number) => void;
}) {
  const completedDate = formatDate(campaign.completedAt);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-slate-100">
        <Image
          src={campaign.placeImageUrl}
          alt={campaign.institutionName}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3">
          <Badge variant="outline" className={statusClass(campaign.status)}>
            {statusLabel(campaign.status)}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-2 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            {campaign.locality} - {campaign.address}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-950">
          {campaign.institutionName}
        </h3>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span className="text-slate-600">
              {formatMoney(campaign.approvedTotal)}
            </span>
            <span className="text-primary">{campaign.visualPercentage}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full rounded-full",
                campaign.status === "ACTIVE" ? "bg-primary" : "bg-emerald-500",
              )}
              style={{ width: `${campaign.visualPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Objetivo: {formatMoney(campaign.goalAmount)}
          </p>
          {(campaign.hasIncomingTransfers || campaign.hasOutgoingTransfer) && (
            <div className="mt-3 grid gap-1 text-xs leading-5 text-slate-600">
              {campaign.hasIncomingTransfers && (
                <p>
                  Incluye {formatMoney(campaign.incomingTransferTotal)} de una
                  campaña anterior.
                </p>
              )}
              {campaign.hasOutgoingTransfer && (
                <p>
                  Excedente transferido:{" "}
                  {formatMoney(campaign.outgoingTransferAmount)}.
                </p>
              )}
            </div>
          )}
        </div>

        {campaign.additionalImageUrls.length > 0 && (
          <div
            className={cn(
              "mt-5 grid gap-2",
              campaign.additionalImageUrls.length === 1
                ? "grid-cols-1"
                : "grid-cols-2",
            )}
          >
            {campaign.additionalImageUrls.slice(0, 2).map((imageUrl, index) => (
              <button
                type="button"
                key={`${campaign.id}-additional-${imageUrl}`}
                className="relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => onViewAdditionalImage(imageUrl, index)}
                aria-label={`Ampliar foto adicional ${index + 1} de ${campaign.institutionName}`}
              >
                <Image
                  src={imageUrl}
                  alt={`Foto adicional ${index + 1} de ${campaign.institutionName}`}
                  fill
                  sizes="(min-width: 1280px) 15vw, (min-width: 768px) 22vw, 100vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {campaign.status === "ACTIVE" ? (
              <Button asChild className="bg-primary text-white">
                <Link href="/quiero-ser-parte">
                  Quiero ser parte <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Objetivo alcanzado
              </div>
            )}
            {(campaign.invoiceImageUrls.length > 0 ||
              campaign.invoiceImageUrl) && (
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={onViewInvoice}
              >
                <FileText className="h-4 w-4" />
                Ver factura
              </Button>
            )}
          </div>
          {completedDate && (
            <span className="text-xs text-slate-500">{completedDate}</span>
          )}
        </div>
      </div>
    </article>
  );
}

function AdditionalImageDialog({
  selectedImage,
  onOpenChange,
}: {
  selectedImage: {
    campaign: PublicCampaign;
    imageUrl: string;
    index: number;
  } | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = selectedImage?.imageUrl ?? null;

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <Dialog open={Boolean(selectedImage)} onOpenChange={onOpenChange}>
      <DialogContent
        className="box-border h-auto max-h-[92svh] w-[calc(100vw-2rem)] max-w-5xl overflow-hidden rounded-lg bg-white p-0"
        closeButtonClassName="[&_svg]:h-5 [&_svg]:w-5 [&_svg]:bg-transparent [&_svg]:text-slate-700"
      >
        <div className="flex max-h-[92svh] min-h-0 flex-col">
          <DialogHeader className="border-b border-slate-200 px-5 py-4 pr-14 md:px-6">
            <DialogTitle className="text-xl font-semibold text-slate-950">
              Foto de la campaña
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {selectedImage
                ? `${selectedImage.campaign.institutionName} - ${selectedImage.campaign.locality}`
                : "Imagen de campaña"}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
            {imageUrl && !hasImageError ? (
              <img
                src={imageUrl}
                alt={`Foto adicional ${(selectedImage?.index ?? 0) + 1} de ${
                  selectedImage?.campaign.institutionName ?? "la campana"
                }`}
                className="mx-auto h-auto max-h-[70svh] max-w-full rounded-md border border-slate-200 bg-white object-contain shadow-sm"
                onError={() => setHasImageError(true)}
              />
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
                No se pudo cargar la imagen.
              </div>
            )}
          </div>

          {imageUrl && (
            <div className="border-t border-slate-200 bg-white px-5 py-4 md:px-6">
              <Button asChild variant="outline" className="gap-2">
                <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                  Abrir imagen en una nueva pestaña
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDialog({
  campaign,
  onOpenChange,
}: {
  campaign: PublicCampaign | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const invoiceUrls =
    campaign && campaign.invoiceImageUrls.length > 0
      ? campaign.invoiceImageUrls
      : campaign?.invoiceImageUrl
        ? [campaign.invoiceImageUrl]
        : [];
  const firstInvoiceUrl = invoiceUrls[0] ?? null;

  useEffect(() => {
    setHasImageError(false);
  }, [campaign?.id]);

  return (
    <Dialog open={Boolean(campaign)} onOpenChange={onOpenChange}>
      <DialogContent
        className="box-border h-auto max-h-[92svh] w-[calc(100vw-2rem)] max-w-5xl overflow-hidden rounded-lg bg-white p-0"
        closeButtonClassName="[&_svg]:h-5 [&_svg]:w-5 [&_svg]:bg-transparent [&_svg]:text-slate-700"
      >
        <div className="flex max-h-[92svh] min-h-0 flex-col">
          <DialogHeader className="border-b border-slate-200 px-5 py-4 pr-14 md:px-6">
            <DialogTitle className="text-xl font-semibold text-slate-950">
              Factura de compra del DEA
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {campaign
                ? `${campaign.institutionName} - ${campaign.locality}`
                : "Documento de compra"}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
            {invoiceUrls.length > 0 && !hasImageError ? (
              <div className="grid gap-4">
                {invoiceUrls.slice(0, 2).map((invoiceUrl, index) => (
                  <img
                    key={`${campaign?.id}-invoice-${invoiceUrl}`}
                    src={invoiceUrl}
                    alt={`Factura de compra del DEA pagina ${index + 1} para ${
                      campaign?.institutionName ?? "la campana"
                    }`}
                    className="mx-auto h-auto max-w-full rounded-md border border-slate-200 bg-white object-contain shadow-sm"
                    onError={() => setHasImageError(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
                No se pudo cargar la imagen de la factura.
              </div>
            )}
          </div>

          {firstInvoiceUrl && (
            <div className="border-t border-slate-200 bg-white px-5 py-4 md:px-6">
              <Button asChild variant="outline" className="gap-2">
                <a
                  href={firstInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir imágen en una nueva pestaña
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
