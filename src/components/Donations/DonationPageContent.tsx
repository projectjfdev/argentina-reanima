"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { donationBankData } from "@/libs/donations/bankData";
import { DonationCampaignVideo } from "./DonationCampaignVideo";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Copy,
  Eye,
  GraduationCap,
  HandCoins,
  Heart,
  HeartPulse,
  Info,
  Loader2,
  MapPin,
  Shield,
  Target,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type FormEvent,
  type ReactNode,
} from "react";
import { Toaster, toast } from "sonner";
import { Titleh1 } from "../Texts/Titleh1";

type DonationVisibility = "public" | "anonymous";

type PublicCampaign = {
  id: number;
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  youtubeVideoUrl: string | null;
  goalAmount: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
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

type PublicDonor = {
  displayName: string;
  amount: string;
  createdAt: string;
};

type CurrentCampaignResponse = {
  campaign: PublicCampaign | null;
  donors: PublicDonor[];
  success: boolean;
};

const DONATION_RECEIPT_ACCEPT = "image/jpeg,image/png";
const DONATION_RECEIPT_ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const GOAL_AMOUNT_NOTE =
  "La meta se calcula según costos estimados para adquirir e instalar el DEA y puede actualizarse si esos costos varían antes de la compra.";

const donationSteps = [
  {
    icon: Building2,
    title: "Elegimos una institución",
    description:
      "Seleccionamos una escuela pública, un club de barrio o un espacio público que hoy no cuenta con un DEA, utilizando criterios objetivos, profesionales y transparentes.",
  },
  {
    icon: HandCoins,
    title: "Hacés tu aporte",
    description:
      "Transferís el monto que desees y cargás el comprobante. Cada aporte suma.",
  },
  {
    icon: Eye,
    title: "Elegís cómo querés aparecer",
    description:
      "Podés figurar en el listado de donantes o realizar tu aporte de manera anónima.",
  },
  {
    icon: ClipboardCheck,
    title: "Verificamos tu donación",
    description:
      "Controlamos el comprobante y actualizamos el monto recaudado para garantizar la transparencia de la campaña.",
  },
  {
    icon: HeartPulse,
    title: "Compramos e instalamos el DEA",
    description:
      "Al alcanzar el objetivo adquirimos el DEA, el gabinete y la cartelería reglamentaria. Publicamos toda la documentación de la compra.",
  },
  {
    icon: GraduationCap,
    title: "Capacitamos gratuitamente a la institución",
    description:
      "Representantes de todos los turnos reciben capacitación en RCP y uso del DEA",
  },
];

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
});

function formatMoney(value: string | null | undefined) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue)
    ? moneyFormatter.format(numericValue)
    : "$ 0";
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getCampaignStatusText(campaign: PublicCampaign | null) {
  if (!campaign) return "Sin campaña activa";
  if (campaign.status === "COMPLETED") return "Objetivo alcanzado";
  return "Campaña en curso";
}

export function DonationPageContent() {
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [donors, setDonors] = useState<PublicDonor[]>([]);
  const [donorPage, setDonorPage] = useState(1);
  const [donorTotalPages, setDonorTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadCurrentCampaign = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/donation-campaigns/current", {
        cache: "no-store",
      });
      const data = (await response.json()) as CurrentCampaignResponse;

      if (!response.ok) {
        throw new Error("No se pudo cargar la campaña");
      }

      setCampaign(data.campaign);
      setDonors(data.donors ?? []);
      setDonorPage(1);
      setDonorTotalPages(null);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar la Campaña de donacion");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentCampaign();
  }, [loadCurrentCampaign]);

  const loadMoreDonors = async () => {
    if (!campaign || isLoadingDonors) return;

    const nextPage = donorPage + 1;
    setIsLoadingDonors(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: "10",
      });
      const response = await fetch(
        `/api/donation-campaigns/${campaign.id}/donors?${params.toString()}`,
        { cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error("No se pudieron cargar mas donantes");
      }

      setDonors((current) => [...current, ...(data.donors ?? [])]);
      setDonorPage(nextPage);
      setDonorTotalPages(data.totalPages ?? nextPage);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar mas donantes");
    } finally {
      setIsLoadingDonors(false);
    }
  };

  const canLoadMoreDonors = useMemo(() => {
    if (!campaign || donors.length < 10) return false;
    if (donorTotalPages === null) return true;
    return donorPage < donorTotalPages;
  }, [campaign, donorPage, donorTotalPages, donors.length]);

  const openDonationModal = () => {
    if (!campaign?.canDonate) return;
    setIsDialogOpen(true);
  };

  const heroImage = campaign?.placeImageUrl ?? "/images/4.jpeg";
  const visualPercentage = campaign?.visualPercentage ?? 0;

  return (
    <main className="bg-white text-slate-950">
      <section className="relative isolate min-h-[88svh] overflow-hidden bg-slate-950 pt-24">
        <Image
          src={heroImage}
          alt={
            campaign
              ? `${campaign.institutionName} - ${campaign.locality}`
              : "Campaña de donacion Argentina Reanima"
          }
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/86 via-slate-950/60 to-slate-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

        <div className="container relative z-10 mx-auto grid min-h-[calc(88svh-6rem)] gap-10 px-4 py-16 md:grid-cols-[1fr_0.9fr] md:items-center md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-3xl text-white"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Heart className="h-4 w-4 text-primary" />
              {getCampaignStatusText(campaign)}
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              QUIERO SER PARTE
            </h1>
            <h3 className="text-xl font-semibold text-primary md:text-4xl">
              de una nueva oportunidad
            </h3>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
              {campaign
                ? `Hoy podés ser parte de ese cambio. Con tu aporte vamos a instalar un DEA, capacitar gratuitamente a la institución y publicar cada paso de la campaña para que puedas seguir el destino de tu donación.`
                : // ? `${campaign.locality} - ${campaign.address}. Cuando se llegue al objetivo, se instala el DEA y se capacita gratis.`
                  "En este momento no hay una campaña disponible para recibir donaciones."}
            </p>
            <Button
              size="lg"
              disabled={!campaign?.canDonate}
              className="mt-8 h-12 bg-primary px-6 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={campaign?.canDonate ? openDonationModal : undefined}
            >
              {campaign?.canDonate ? "Quiero ser parte" : "Donaciones cerradas"}
              <Heart className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <DonationProgressSummary campaign={campaign} isLoading={isLoading} />
        </div>
      </section>

      <Titleh1
        title={
          campaign
            ? `Una comunidad preparada puede darle una nueva oportunidad a quien sufra una muerte súbita.`
            : "Pronto tendremos una nueva campaña activa."
        }
        className="mx-auto mt-10 text-pretty text-3xl font-semibold md:text-4xl lg:max-w-4xl"
      />

      <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-24">
        <DonationDeaProgress
          percentage={visualPercentage}
          hasCampaign={Boolean(campaign)}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.42, ease: "easeOut", delay: 0.06 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {getCampaignStatusText(campaign)}
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            Cada donación construye una nueva oportunidad.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            Cada aporte verificado nos acerca al objetivo. Cuando alcancemos la
            meta instalaremos el DEA, publicaremos la factura de compra y
            capacitaremos gratuitamente a la institución.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoPoint text="100% destinado a compra de DEA" />
            <InfoPoint text="Monto confirmado desde el comprobante" />
            <InfoPoint text="Excedentes aplicados a la próxima campaña" />
            <InfoPoint text="Meta económica sujeta a actualización por variación de costos" />
          </div>
        </motion.div>
      </section>

      <section className="bg-slate-50 px-4 py-16 md:py-24">
        <div className="container mx-auto grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-stretch">
          <DonationPlaceCard campaign={campaign} />

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Proceso transparente
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
              ¿Cómo funciona tu aporte?
            </h2>

            <div className="mt-8">
              {donationSteps.map((step, index) => (
                <DonationTimelineStep
                  key={step.title}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  stepNumber={index + 1}
                  isLast={index === donationSteps.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {campaign?.status === "ACTIVE" && (
        <DonationCampaignVideo youtubeVideoUrl={campaign.youtubeVideoUrl} />
      )}

      <PublicDonorList
        donors={donors}
        canLoadMore={canLoadMoreDonors}
        isLoading={isLoadingDonors}
        onLoadMore={loadMoreDonors}
      />

      <section id="donar" className="px-4 py-16 md:py-24">
        <div className="container mx-auto text-center">
          {campaign?.canDonate ? (
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
                Hoy podés ser parte de una nueva oportunidad.
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                Cada aporte nos acerca a una institución y/o espacio mejor
                preparado para responder durante los primeros minutos de una
                emergencia por muerte súbita.
              </p>

              <button
                type="button"
                onClick={openDonationModal}
                className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Quiero ser parte
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <h2 className="text-2xl font-semibold text-slate-950">
                {campaign
                  ? "Esta campaña ya no acepta donaciones."
                  : "No hay una campaña activa para donar."}
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {campaign
                  ? "El objetivo fue alcanzado o la campaña fue cerrada. Gracias por acompañarnos."
                  : "Pronto publicaremos una nueva campaña para instalar un DEA."}
              </p>

              {campaign && (
                <Link
                  href="/campanas-dea"
                  className="mt-3 inline-block text-sm font-semibold text-primary underline transition-colors hover:text-primary/80"
                >
                  Ver todas las campañas
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <DonationModal
        campaign={campaign}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmitted={loadCurrentCampaign}
      />
      <Toaster />
    </main>
  );
}

function DonationProgressSummary({
  campaign,
  isLoading,
}: {
  campaign: PublicCampaign | null;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
      className="rounded-lg border border-white/20 bg-white/90 p-5 shadow-2xl shadow-black/25 backdrop-blur md:p-6"
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
        <Target className="h-4 w-4" />
        {campaign && campaign.institutionName
          ? campaign.institutionName
          : "Sin campaña activa"}
      </div>
      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando campaña...
        </div>
      ) : campaign ? (
        <>
          <p className="mt-1 text-sm text-slate-600">
            {campaign.locality} - {campaign.address}
          </p>
          <div className="mt-5">
            <p className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {formatMoney(campaign.approvedTotal)}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-lg text-slate-600">
              <span>recaudados de {formatMoney(campaign.goalAmount)}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="Información sobre la meta económica"
                    >
                      <Info className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-pretty leading-5">
                    {GOAL_AMOUNT_NOTE}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-600">Avance de la campaña</span>
              <span className="text-primary">{campaign.visualPercentage}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${campaign.visualPercentage}%` }}
              />
            </div>
          </div>
          <p className="mt-5 flex gap-3 text-sm leading-6 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            {campaign.canDonate
              ? "Cuando lleguemos al objetivo, instalamos el DEA y capacitamos gratis."
              : "Objetivo alcanzado o campaña cerrada para nuevas donaciones."}
          </p>
          <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm leading-6 text-slate-700">
            Esta campaña no termina cuando llegamos al objetivo. Ese día
            comienza la siguiente.
          </div>
          {(campaign.hasIncomingTransfers || campaign.hasOutgoingTransfer) && (
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
              {campaign.hasIncomingTransfers && (
                <p>
                  Incluye {formatMoney(campaign.incomingTransferTotal)}{" "}
                  transferidos desde una campaña anterior.
                </p>
              )}
              {campaign.hasOutgoingTransfer && (
                <p>
                  Excedente transferido a la siguiente campaña:{" "}
                  {formatMoney(campaign.outgoingTransferAmount)}.
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="min-h-56">
          <p className="text-2xl font-semibold text-slate-950">
            No hay campaña disponible
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            En este momento no hay una campaña activa o completada para mostrar.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function DonationDeaProgress({
  percentage,
  hasCampaign,
}: {
  percentage: number;
  hasCampaign: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-slate-50">
        <Image
          src="/images/dea.png"
          alt="DEA parcialmente preparado segun el avance de la campaña"
          fill
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-contain grayscale"
        />
        <div
          className="absolute inset-0 bg-primary/50 transition-[clip-path] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            clipPath: `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`,
          }}
          aria-hidden="true"
        >
          <Image
            src="/images/dea.png"
            alt=""
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-contain"
          />
        </div>
        <div
          className="absolute inset-y-8 w-px bg-primary/80 shadow-[0_0_0_1px_rgba(44,156,193,0.18)]"
          style={{ left: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="absolute right-5 top-5 max-w-[230px] rounded-lg border border-slate-200 bg-white/95 p-4 text-sm leading-6 shadow-lg backdrop-blur">
        {hasCampaign ? (
          <>
            Hasta ahora hay un{" "}
            <span className="text-xl font-semibold text-primary">
              {percentage}%
            </span>{" "}
            de preparación para salvar vidas en este lugar.
          </>
        ) : (
          "El avance aparecera cuando haya una campaña publicada."
        )}
      </div>
    </motion.div>
  );
}

function DonationPlaceCard({ campaign }: { campaign: PublicCampaign | null }) {
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:min-h-[420px]">
      <Image
        src={
          campaign?.placeImageUrl ?? "/images/placeholder-location-campaign.png"
        }
        alt={
          campaign
            ? `${campaign.institutionName} - lugar seleccionado`
            : "Lugar seleccionado para campaña de DEA"
        }
        fill
        sizes="(min-width: 768px) 45vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/58 to-slate-950/18" />
      <div className="absolute inset-0 bg-slate-950/18" />
      <div className="relative z-10 flex h-full flex-col justify-end">
        <MapPin className="mb-5 h-9 w-9 text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" />
        <p className="max-w-xl text-lg font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
          {campaign ? campaign.locality : "Proxima campaña"}
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] md:text-5xl">
          {campaign
            ? campaign.institutionName
            : "Entre todos podemos instalar mas DEA."}
        </h2>
        {campaign && (
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
            {campaign.address}
          </p>
        )}
      </div>
    </div>
  );
}

function PublicDonorList({
  donors,
  canLoadMore,
  isLoading,
  onLoadMore,
}: {
  donors: PublicDonor[];
  canLoadMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}) {
  return (
    <section className="px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Donantes verificados
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Aportes aprobados
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-600">
            Solo aparecen donaciones revisadas por administración. Si tu
            donación no aparece, es porque aún no fue aprobada.
          </p>
        </div>

        {donors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Todavía no hay donaciones aprobadas para mostrar.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 md:px-6">
                      Donante
                    </th>
                    <th scope="col" className="px-4 py-3 md:px-6">
                      Fecha
                    </th>
                    <th scope="col" className="px-4 py-3 text-right md:px-6">
                      Aporte
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donors.map((donor, index) => (
                    <tr
                      key={`${donor.displayName}-${donor.createdAt}-${index}`}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="max-w-[220px] truncate px-4 py-4 font-semibold text-slate-950 md:max-w-none md:px-6">
                        {donor.displayName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600 md:px-6">
                        {formatDate(donor.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-primary md:px-6">
                        {formatMoney(donor.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {canLoadMore && (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "Ver mas"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function DonationModal({
  campaign,
  open,
  onOpenChange,
  onSubmitted,
}: {
  campaign: PublicCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => Promise<void>;
}) {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [donationVisibility, setDonationVisibility] =
    useState<DonationVisibility>("anonymous");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetDonationModalState = () => {
    setSelectedFileName("");
    setDonationVisibility("anonymous");
    setIsSubmitting(false);
    setIsSubmitted(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) resetDonationModalState();
  };

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      toast.error(`No pudimos copiar el ${label}`);
    }
  };

  const handleSubmitDonation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!campaign?.canDonate) {
      toast.error("La campaña ya no acepta donaciones.");
      handleOpenChange(false);
      await onSubmitted();
      return;
    }

    const form = event.currentTarget;
    const rawFormData = new FormData(form);
    const receipt = rawFormData.get("receipt");
    const isPublicDonation = donationVisibility === "public";
    const firstName = rawFormData.get("firstName");
    const lastName = rawFormData.get("lastName");
    const email = rawFormData.get("email");

    if (
      (isPublicDonation && (!firstName || !lastName)) ||
      !email ||
      !(receipt instanceof File) ||
      receipt.size === 0
    ) {
      toast.error("Completa los campos requeridos para enviar el comprobante.");
      return;
    }

    if (!DONATION_RECEIPT_ALLOWED_TYPES.has(receipt.type)) {
      toast.error("El comprobante debe ser una imagen JPG, JPEG o PNG.");
      return;
    }

    const formData = new FormData();
    formData.append("campaignId", String(campaign.id));
    formData.append("visibility", donationVisibility);
    formData.append("receipt", receipt);
    if (isPublicDonation) {
      formData.append("firstName", String(firstName));
      formData.append("lastName", String(lastName));
    }
    formData.append("email", String(email));

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/donations", {
        cache: "no-store",
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "No se pudo enviar el comprobante",
        );
      }

      form.reset();
      setSelectedFileName("");
      setDonationVisibility("anonymous");
      setIsSubmitted(true);
      await onSubmitted();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el comprobante",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`box-border h-auto max-h-[92svh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-lg bg-white p-0 ${
          isSubmitted ? "sm:max-w-2xl" : "sm:max-w-6xl"
        }`}
        closeButtonClassName="[&_svg]:h-5 [&_svg]:w-5 [&_svg]:bg-transparent [&_svg]:text-slate-700"
      >
        {isSubmitted ? (
          <DonationThanksScreen onClose={() => handleOpenChange(false)} />
        ) : (
          <div className="grid w-full min-w-0 max-w-full overflow-x-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="box-border min-w-0 max-w-full overflow-hidden bg-slate-950 p-6 text-white md:p-8">
              <DialogHeader>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary/20 text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <DialogTitle className="text-3xl font-semibold text-white">
                  Realizá tu donación
                </DialogTitle>
                <DialogDescription className="mt-3 text-base leading-7 text-white/75">
                  Transferí a la cuenta indicada y subí el comprobante. El monto
                  se confirma administrativamente al revisar el archivo. Si el
                  objetivo ya fue superado, el excedente se destinara a la
                  proxima campaña.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 box-border w-full min-w-0 max-w-full rounded-lg border border-white/15 bg-white/10 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Datos bancarios</h3>
                </div>
                <div className="space-y-3">
                  <BankRow label="Banco" value={donationBankData.banco} />
                  <BankRow label="Alias" value={donationBankData.alias} />
                  <BankRow label="CBU" value={donationBankData.cbu} />
                  <BankRow
                    label="Cuenta Corriente en Pesos"
                    value={donationBankData.cuenta}
                  />
                  <BankRow
                    label="Razón Social"
                    value={donationBankData.razonSocial}
                  />
                  <BankRow label="CUIT" value={donationBankData.cuit} />
                </div>
                <div className="mt-5 grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-0 border-white/25 bg-white/10 text-white hover:bg-white hover:text-slate-950"
                    onClick={() =>
                      copyToClipboard("Alias", donationBankData.alias)
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Alias
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-0 border-white/25 bg-white/10 text-white hover:bg-white hover:text-slate-950"
                    onClick={() => copyToClipboard("CBU", donationBankData.cbu)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar CBU
                  </Button>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmitDonation}
              className="box-border flex w-full min-w-0 max-w-full flex-col gap-5 overflow-x-hidden p-6 md:p-8"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Informar transferencia
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                  Enviá tu comprobante
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  El monto lo verificamos desde el comprobante al momento de
                  aprobar la donación.
                </p>
              </div>

              <div className="box-border w-full min-w-0 max-w-full rounded-lg border border-slate-200 bg-slate-50/70 p-4 md:p-5">
                <div>
                  <h4 className="text-lg font-semibold text-slate-950">
                    ¿Querés que tu nombre aparezca?
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Podés elegir cómo mostrar tu aporte.
                  </p>
                </div>

                <div className="mt-5 grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-2">
                  <DonationVisibilityCard
                    icon={UserRound}
                    title="Si, quiero aparecer en el listado"
                    description="Mi nombre podra visualizarse en el listado público de donantes."
                    value="public"
                    selectedValue={donationVisibility}
                    onSelect={setDonationVisibility}
                  />
                  <DonationVisibilityCard
                    icon={Shield}
                    title="Prefiero que mi aporte sea anónimo"
                    description="Mi donación será contabilizada sin mostrar mis datos personales."
                    value="anonymous"
                    selectedValue={donationVisibility}
                    onSelect={setDonationVisibility}
                  />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {donationVisibility === "public" && (
                  <motion.div
                    key="public-donor-fields"
                    initial={{
                      opacity: 0,
                      height: 0,
                      transform: "translateY(-6px)",
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      transform: "translateY(0)",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transform: "translateY(-6px)",
                    }}
                    transition={{
                      duration: 0.22,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className="grid w-full min-w-0 max-w-full overflow-hidden"
                  >
                    <div className="grid w-full min-w-0 max-w-full gap-4 sm:grid-cols-2">
                      <DonationField label="Nombre" htmlFor="donation-name">
                        <Input
                          id="donation-name"
                          name="firstName"
                          required={donationVisibility === "public"}
                          placeholder="Tu nombre"
                          className="h-11 min-w-0 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                        />
                      </DonationField>
                      <DonationField
                        label="Apellido"
                        htmlFor="donation-lastname"
                      >
                        <Input
                          id="donation-lastname"
                          name="lastName"
                          required={donationVisibility === "public"}
                          placeholder="Tu apellido"
                          className="h-11 min-w-0 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                        />
                      </DonationField>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <DonationField label="Email" htmlFor="donation-email">
                <Input
                  id="donation-email"
                  name="email"
                  type="email"
                  required
                  placeholder="nombre@email.com"
                  className="h-11 min-w-0 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                />
              </DonationField>

              <DonationField
                label="Adjuntar comprobante de pago"
                htmlFor="donation-receipt"
              >
                <div className="relative box-border w-full min-w-0 max-w-full overflow-hidden rounded-lg">
                  <label
                    htmlFor="donation-receipt"
                    className="box-border flex min-h-28 w-full min-w-0 max-w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-primary/60 hover:bg-primary/5"
                  >
                    <Clipboard className="mb-3 h-7 w-7 text-primary" />
                    <span className="max-w-full text-sm font-semibold text-slate-950">
                      Seleccionar comprobante
                    </span>
                    <span className="mt-1 max-w-full text-xs text-slate-500">
                      Formatos permitidos: JPG, JPEG o PNG. Tamano maximo 5MB.
                    </span>
                    {selectedFileName && (
                      <span className="mt-3 max-w-full truncate rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {selectedFileName}
                      </span>
                    )}
                  </label>
                  <Input
                    id="donation-receipt"
                    name="receipt"
                    type="file"
                    required
                    accept={DONATION_RECEIPT_ACCEPT}
                    tabIndex={-1}
                    className="pointer-events-none absolute inset-0 h-full w-full min-w-0 max-w-full opacity-0"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (
                        file &&
                        !DONATION_RECEIPT_ALLOWED_TYPES.has(file.type)
                      ) {
                        event.target.value = "";
                        setSelectedFileName("");
                        toast.error(
                          "El comprobante debe ser una imagen JPG, JPEG o PNG.",
                        );
                        return;
                      }

                      setSelectedFileName(file?.name || "");
                    }}
                  />
                </div>
              </DonationField>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 bg-primary text-white hover:bg-primary/90"
              >
                {isSubmitting ? "Enviando..." : "Enviar comprobante"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DonationThanksScreen({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="flex min-h-[520px] flex-col items-center justify-center px-6 py-10 text-center md:px-10"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <DialogHeader className="mt-6 items-center text-center">
        <DialogTitle className="text-3xl font-semibold leading-tight text-slate-950">
          ❤️ ¡Gracias por ser parte!
        </DialogTitle>
        <DialogDescription className="sr-only">
          Recibimos correctamente tu comprobante
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 max-w-xl space-y-4 text-sm leading-7 text-slate-600 md:text-base">
        <p>
          Con tu decisión, la campaña "Quiero Ser Parte" está un paso más cerca
          de incorporar un nuevo DEA y capacitar a una institución que lo
          necesita.
        </p>
        <p>
          Ahora nuestro equipo verificará el comprobante. Una vez validado, tu
          aporte se reflejará automáticamente en el avance de la campaña y, si
          así lo elegiste, también aparecerás en el listado público de quienes
          decidieron acompañar esta iniciativa.
        </p>
        <p>Gracias por ayudarnos a construir una nueva oportunidad.</p>
        <p className="font-semibold text-slate-800">
          Seguimos luchando juntos contra la muerte súbita.
        </p>
      </div>
      <p className="font-semibold text-sm text-slate-600">
        ¿Necesitás un recibo?
      </p>
      <p className="font-semibold text-sm text-slate-600">
        Escribinos a argentinareanima.ac@gmail.com y adjuntá el comprobante de
        tu donación. Te enviaremos el recibo correspondiente.
      </p>

      <Button
        type="button"
        className="mt-8 h-11 bg-primary px-6 text-white hover:bg-primary/90"
        onClick={onClose}
      >
        Cerrar
      </Button>
    </motion.div>
  );
}

const InfoPoint = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
    <p className="text-sm font-semibold text-slate-800">{text}</p>
  </div>
);

const BankRow = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 rounded-md bg-white/8 p-3">
    <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">
      {label}
    </p>
    <p className="mt-1 min-w-0 break-all text-sm font-semibold text-white">
      {value}
    </p>
  </div>
);

const DonationField = ({
  label,
  htmlFor,
  children,
  required = true,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) => (
  <div className="grid w-full min-w-0 max-w-full gap-2">
    <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
      {label}
      {required ? (
        <span className="ml-1 text-primary">*</span>
      ) : (
        <span className="ml-2 text-xs font-medium text-slate-500">
          opcional
        </span>
      )}
    </Label>
    {children}
  </div>
);

const DonationVisibilityCard = ({
  icon: Icon,
  title,
  description,
  value,
  selectedValue,
  onSelect,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  value: DonationVisibility;
  selectedValue: DonationVisibility;
  onSelect: (value: DonationVisibility) => void;
}) => {
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(value)}
      className={`group relative box-border w-full min-w-0 max-w-full rounded-lg border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:transition-none ${
        isSelected
          ? "border-primary bg-primary/10 shadow-[0_10px_30px_rgba(44,156,193,0.14)]"
          : "border-slate-200 bg-white hover:border-primary/35 hover:bg-white hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03] motion-reduce:transition-none ${
            isSelected
              ? "border-primary bg-primary text-white"
              : "border-slate-200 bg-slate-50 text-primary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <p className="text-sm font-semibold leading-5 text-slate-950">
              {title}
            </p>
            {isSelected && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            )}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
        </div>
      </div>
    </button>
  );
};

const DonationTimelineStep = ({
  icon: Icon,
  title,
  description,
  stepNumber,
  isLast,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  stepNumber: number;
  isLast: boolean;
}) => (
  <div className="group relative grid grid-cols-[3rem_1fr] gap-4 pb-7 last:pb-0">
    {!isLast && (
      <div
        className="absolute bottom-0 left-6 top-12 w-px -translate-x-1/2 bg-slate-200"
        aria-hidden="true"
      />
    )}
    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm transition-[background-color,border-color,color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-primary/35 group-hover:bg-primary group-hover:text-white group-active:scale-[0.97] motion-reduce:transition-none md:group-hover:scale-[1.04]">
      <Icon className="h-5 w-5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none md:group-hover:scale-105" />
    </div>
    <div className="rounded-lg border border-transparent p-1 transition-[border-color,background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-primary/10 group-hover:bg-primary/[0.03] group-active:scale-[0.99] motion-reduce:transition-none md:group-hover:translate-x-1">
      <div className="mb-2 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Paso {stepNumber}
        </span>
        <span className="h-px flex-1 bg-slate-100" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold leading-snug text-slate-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  </div>
);
