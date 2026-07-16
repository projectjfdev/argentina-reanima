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
import { donationBankData } from "@/libs/donations/bankData";
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
  Loader2,
  MapPin,
  Shield,
  Target,
  UserRound,
} from "lucide-react";
import Image from "next/image";
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

type DonationVisibility = "public" | "anonymous";

type PublicCampaign = {
  id: number;
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  goalAmount: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  approvedTotal: string;
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

const donationSteps = [
  {
    icon: Building2,
    title: "Elegimos una institucion",
    description:
      "Seleccionamos una institucion, club, escuela o espacio publico que actualmente no cuenta con un DEA.",
  },
  {
    icon: HandCoins,
    title: "Realizas tu aporte",
    description:
      "Colaboras mediante transferencia bancaria y subis el comprobante para que podamos verificarlo.",
  },
  {
    icon: Eye,
    title: "Elegis como aparecer",
    description:
      "Podes decidir si tu donacion figura publicamente en el listado de donantes o permanece anonima.",
  },
  {
    icon: ClipboardCheck,
    title: "Verificamos la donacion",
    description:
      "Nuestro equipo revisa el comprobante y carga el monto real antes de aprobar la donacion.",
  },
  {
    icon: HeartPulse,
    title: "Instalamos el DEA",
    description:
      "Al alcanzar el objetivo realizamos la compra, instalacion del DEA y publicamos la documentacion correspondiente.",
  },
  {
    icon: GraduationCap,
    title: "Capacitamos gratuitamente",
    description:
      "Ademas de instalar el DEA, brindamos una capacitacion gratuita en RCP y uso del DEA para la institucion beneficiada.",
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
  const realPercentage = campaign?.percentage ?? 0;

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
              Un DEA puede marcar la diferencia entre la vida y la muerte.
            </h1>
            <p className="mt-5 text-2xl font-semibold text-primary md:text-4xl">
              {campaign
                ? `Ayudanos a instalar uno en ${campaign.institutionName}.`
                : "Pronto tendremos una nueva campaña activa."}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
              {campaign
                ? `${campaign.locality} - ${campaign.address}. Cuando se llegue al objetivo, se instala el DEA y se capacita gratis.`
                : "En este momento no hay una campaña disponible para recibir donaciones."}
            </p>
            <Button
              size="lg"
              disabled={!campaign?.canDonate}
              className="mt-8 h-12 bg-primary px-6 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={campaign?.canDonate ? openDonationModal : undefined}
            >
              {campaign?.canDonate ? "Donar ahora" : "Donaciones cerradas"}
              <Heart className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <DonationProgressSummary campaign={campaign} isLoading={isLoading} />
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-24">
        <DonationDeaProgress
          percentage={visualPercentage}
          realPercentage={realPercentage}
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
            Cada donacion aprobada acerca al lugar a estar preparado.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            El avance visual del DEA muestra el porcentaje recaudado con
            donaciones verificadas por administracion. La parte en color
            representa lo que ya se logro; la parte en blanco y negro, lo que
            falta completar.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoPoint text="100% destinado a compra de DEA" />
            <InfoPoint text="Monto confirmado desde el comprobante" />
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
              Como funciona tu aporte
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

      <PublicDonorList
        donors={donors}
        canLoadMore={canLoadMoreDonors}
        isLoading={isLoadingDonors}
        onLoadMore={loadMoreDonors}
      />

      <section id="donar" className="px-4 py-16 md:py-24">
        <div className="container mx-auto">
          {campaign?.canDonate ? (
            <button
              type="button"
              className="group flex w-full cursor-pointer flex-col gap-8 rounded-lg bg-primary p-7 text-left text-white shadow-[0_18px_45px_rgba(44,156,193,0.22)] transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(44,156,193,0.3)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:flex-row md:items-center md:justify-between md:p-10"
              onClick={openDonationModal}
            >
              <div className="flex min-w-0 flex-col gap-5 md:max-w-2xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white/15 text-white shadow-sm">
                  <Heart className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                    Quiero donar
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-7 text-white/85 md:text-lg">
                    Y ser parte de esta comunidad que lucha contra la muerte
                    subita.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center text-base font-semibold text-white transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1 motion-reduce:transition-none md:text-lg">
                Quiero donar <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </button>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <h2 className="text-2xl font-semibold text-slate-950">
                {campaign
                  ? "Esta campaña ya no acepta donaciones."
                  : "No hay una campaña activa para donar."}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {campaign
                  ? "El objetivo fue alcanzado o la campaña fue cerrada. Gracias por acompanarnos."
                  : "Pronto publicaremos una nueva campaña para instalar un DEA."}
              </p>
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
        {getCampaignStatusText(campaign)}
      </div>
      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando campaña...
        </div>
      ) : campaign ? (
        <>
          <p className="text-sm font-medium text-slate-500">
            {campaign.institutionName}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {campaign.locality} - {campaign.address}
          </p>
          <div className="mt-5">
            <p className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {formatMoney(campaign.approvedTotal)}
            </p>
            <p className="mt-2 text-lg text-slate-600">
              recaudados de {formatMoney(campaign.goalAmount)}
            </p>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-600">Avance de la campaña</span>
              <span className="text-primary">{campaign.percentage}%</span>
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
  realPercentage,
  hasCampaign,
}: {
  percentage: number;
  realPercentage: number;
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
          className="absolute inset-0"
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
              {realPercentage}%
            </span>{" "}
            de preparacion para salvar vidas en este lugar.
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
            Solo aparecen donaciones revisadas por administracion. Pendientes y
            rechazadas no se publican ni suman al progreso.
          </p>
        </div>

        {donors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Todavia no hay donaciones aprobadas para mostrar.
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
      onOpenChange(false);
      await onSubmitted();
      return;
    }

    const form = event.currentTarget;
    const rawFormData = new FormData(form);
    const receipt = rawFormData.get("receipt");
    const isPublicDonation = donationVisibility === "public";
    const firstName = rawFormData.get("firstName");
    const lastName = rawFormData.get("lastName");

    if (
      (isPublicDonation && (!firstName || !lastName)) ||
      !(receipt instanceof File) ||
      receipt.size === 0
    ) {
      toast.error("Completa los campos requeridos para enviar el comprobante.");
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
    const email = rawFormData.get("email");
    if (email) formData.append("email", String(email));

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "No se pudo enviar el comprobante",
        );
      }

      toast.success("Muchas gracias por tu donacion", {
        description: "Recibimos tu comprobante y lo revisaremos a la brevedad.",
        duration: 10000,
      });
      form.reset();
      setSelectedFileName("");
      setDonationVisibility("anonymous");
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="box-border h-auto max-h-[92svh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-lg bg-white p-0 sm:max-w-6xl"
        closeButtonClassName="[&_svg]:h-5 [&_svg]:w-5 [&_svg]:bg-transparent [&_svg]:text-slate-700"
      >
        <div className="grid w-full min-w-0 max-w-full overflow-x-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="box-border min-w-0 max-w-full overflow-hidden bg-slate-950 p-6 text-white md:p-8">
            <DialogHeader>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary/20 text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <DialogTitle className="text-3xl font-semibold text-white">
                Realiza tu donacion
              </DialogTitle>
              <DialogDescription className="mt-3 text-base leading-7 text-white/75">
                Transferi a la cuenta indicada y subi el comprobante. El monto
                se confirma administrativamente al revisar el archivo.
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
                  label="Razon Social"
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
                Envia tu comprobante
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                No declares el monto: lo verificamos desde el comprobante antes
                de aprobar la donacion.
              </p>
            </div>

            <div className="box-border w-full min-w-0 max-w-full rounded-lg border border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <div>
                <h4 className="text-lg font-semibold text-slate-950">
                  Queres que tu nombre aparezca?
                </h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Podes elegir como mostrar tu aporte.
                </p>
              </div>

              <div className="mt-5 grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-2">
                <DonationVisibilityCard
                  icon={UserRound}
                  title="Si, quiero aparecer en el listado."
                  description="Mi nombre podra visualizarse en el listado publico de donantes."
                  value="public"
                  selectedValue={donationVisibility}
                  onSelect={setDonationVisibility}
                />
                <DonationVisibilityCard
                  icon={Shield}
                  title="Prefiero que mi aporte sea anonimo."
                  description="Mi donacion sera contabilizada sin mostrar mis datos personales."
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
                    <DonationField label="Apellido" htmlFor="donation-lastname">
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

            <DonationField
              label="Email"
              htmlFor="donation-email"
              required={false}
            >
              <Input
                id="donation-email"
                name="email"
                type="email"
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
                    Imagen o PDF. Tamano maximo 5MB.
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
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  tabIndex={-1}
                  className="pointer-events-none absolute inset-0 h-full w-full min-w-0 max-w-full opacity-0"
                  onChange={(event) =>
                    setSelectedFileName(event.target.files?.[0]?.name || "")
                  }
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
      </DialogContent>
    </Dialog>
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
