"use client";

import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/libs/utils";
import {
  Archive,
  Check,
  CircleDollarSign,
  FileImage,
  HeartHandshake,
  ImagePlus,
  MoreVertical,
  Pencil,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

type CampaignStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
type DonationStatus = "PENDING" | "APPROVED" | "REJECTED";

type Campaign = {
  id: number;
  institutionName: string;
  locality: string;
  address: string;
  placeImageUrl: string;
  goalAmount: string;
  status: CampaignStatus;
  progress?: {
    approvedTotal: string;
    percentage: number;
    visualPercentage: number;
    isCompleted: boolean;
  };
  donationCounts?: {
    pending: number;
    approved: number;
    rejected: number;
  };
};

type Donation = {
  id: number;
  campaignId: number;
  campaign?: {
    id: number;
    institutionName: string;
    locality: string;
    status: CampaignStatus;
  };
  amount: string | null;
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  status: DonationStatus;
  receiptOriginalName: string | null;
  receiptBytes: number | null;
  createdAt: string;
  reviewedAt: string | null;
};

type CampaignFormState = {
  institutionName: string;
  locality: string;
  address: string;
  goalAmount: string;
  placeImage: File | null;
};

const EMPTY_FORM: CampaignFormState = {
  institutionName: "",
  locality: "",
  address: "",
  goalAmount: "",
  placeImage: null,
};

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatMoney(value: string | null | undefined) {
  if (!value) return "Sin monto";
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? moneyFormatter.format(numericValue)
    : value;
}

function parseMoneyForPreview(value: string | null | undefined) {
  if (!value) return null;
  const cleanValue = value.trim().replace(/\s/g, "").replace(/^\$/, "");
  const lastCommaIndex = cleanValue.lastIndexOf(",");
  const lastDotIndex = cleanValue.lastIndexOf(".");
  let normalizedValue = cleanValue;

  if (lastCommaIndex >= 0 && lastDotIndex >= 0) {
    const decimalSeparator = lastCommaIndex > lastDotIndex ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    normalizedValue = cleanValue
      .replaceAll(thousandsSeparator, "")
      .replace(decimalSeparator, ".");
  } else if (lastCommaIndex >= 0) {
    normalizedValue = cleanValue.replaceAll(".", "").replace(",", ".");
  } else {
    const dotParts = cleanValue.split(".");
    if (dotParts.length > 2) {
      const lastPart = dotParts[dotParts.length - 1];
      normalizedValue =
        lastPart.length <= 2
          ? `${dotParts.slice(0, -1).join("")}.${lastPart}`
          : dotParts.join("");
    } else if (dotParts.length === 2 && dotParts[1].length === 3) {
      normalizedValue = dotParts.join("");
    }
  }

  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

function getDonorName(donation: Donation) {
  if (donation.isAnonymous) return "Anónimo";
  return [donation.firstName, donation.lastName].filter(Boolean).join(" ");
}

function statusLabel(status: CampaignStatus | DonationStatus) {
  const labels: Record<string, string> = {
    ACTIVE: "Activa",
    COMPLETED: "Completada",
    ARCHIVED: "Archivada",
    PENDING: "Pendiente",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
  };

  return labels[status] ?? status;
}

function statusClass(status: CampaignStatus | DonationStatus) {
  if (status === "ACTIVE" || status === "APPROVED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "PENDING") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (status === "REJECTED" || status === "ARCHIVED") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function fileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DonationCampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [form, setForm] = useState<CampaignFormState>(EMPTY_FORM);
  const [campaignStatus, setCampaignStatus] = useState("all");
  const [donationStatus, setDonationStatus] = useState("PENDING");
  const [donationCampaignId, setDonationCampaignId] = useState("all");
  const [campaignSearch, setCampaignSearch] = useState("");
  const [donationSearch, setDonationSearch] = useState("");
  const [campaignPage, setCampaignPage] = useState(1);
  const [donationPage, setDonationPage] = useState(1);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const [donationTotalPages, setDonationTotalPages] = useState(1);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingDonations, setIsLoadingDonations] = useState(false);
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);
  const [activeDonationAction, setActiveDonationAction] = useState<
    number | null
  >(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editingAmount, setEditingAmount] = useState("");
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  const activeCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.status === "ACTIVE") ?? null,
    [campaigns],
  );

  const resetForm = () => {
    setSelectedCampaign(null);
    setForm(EMPTY_FORM);
  };

  const loadCampaigns = useCallback(
    async (pageOverride?: number) => {
      setIsLoadingCampaigns(true);
      try {
        const page = pageOverride ?? campaignPage;
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "6",
        });

        if (campaignStatus !== "all") params.set("status", campaignStatus);
        if (campaignSearch.trim()) params.set("search", campaignSearch.trim());

        const response = await fetch(
          `/api/admin/donation-campaigns?${params.toString()}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Error al cargar");
        }

        setCampaigns(data.campaigns ?? []);
        setCampaignTotalPages(Math.max(data.totalPages ?? 1, 1));
        if (pageOverride) setCampaignPage(pageOverride);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las campañas");
      } finally {
        setIsLoadingCampaigns(false);
      }
    },
    [campaignPage, campaignSearch, campaignStatus],
  );

  const loadDonations = useCallback(
    async (pageOverride?: number) => {
      setIsLoadingDonations(true);
      try {
        const page = pageOverride ?? donationPage;
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "8",
        });

        if (donationStatus !== "all") params.set("status", donationStatus);
        if (donationCampaignId !== "all") {
          params.set("campaignId", donationCampaignId);
        }
        if (donationSearch.trim()) params.set("search", donationSearch.trim());

        const response = await fetch(
          `/api/admin/donations?${params.toString()}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Error al cargar");
        }

        setDonations(data.donations ?? []);
        setDonationTotalPages(Math.max(data.totalPages ?? 1, 1));
        if (pageOverride) setDonationPage(pageOverride);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las donaciones");
      } finally {
        setIsLoadingDonations(false);
      }
    },
    [donationCampaignId, donationPage, donationSearch, donationStatus],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCampaigns();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadCampaigns]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDonations();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadDonations]);

  const refreshAll = async () => {
    await Promise.all([loadCampaigns(), loadDonations()]);
  };

  const selectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setForm({
      institutionName: campaign.institutionName,
      locality: campaign.locality,
      address: campaign.address,
      goalAmount: campaign.goalAmount,
      placeImage: null,
    });
  };

  const submitCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingCampaign(true);

    try {
      if (!selectedCampaign && !form.placeImage) {
        toast.error("La imagen del lugar es obligatoria");
        return;
      }

      const formData = new FormData();
      formData.append("institutionName", form.institutionName);
      formData.append("locality", form.locality);
      formData.append("address", form.address);
      formData.append("goalAmount", form.goalAmount);
      if (form.placeImage) formData.append("placeImage", form.placeImage);

      const response = await fetch(
        selectedCampaign
          ? `/api/admin/donation-campaigns/${selectedCampaign.id}`
          : "/api/admin/donation-campaigns",
        {
          method: selectedCampaign ? "PUT" : "POST",
          body: formData,
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo guardar");
      }

      toast.success(
        selectedCampaign ? "Campaña actualizada" : "Campaña creada",
      );
      resetForm();
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar",
      );
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  const updateCampaignStatus = async (
    campaign: Campaign,
    status: "COMPLETED" | "ARCHIVED",
  ) => {
    const confirmed = window.confirm(
      status === "COMPLETED"
        ? `Completar la campaña de ${campaign.institutionName}?`
        : `Archivar la campaña de ${campaign.institutionName}?`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/donation-campaigns/${campaign.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo actualizar");
      }

      toast.success("Estado actualizado");
      if (selectedCampaign?.id === campaign.id) resetForm();
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo actualizar",
      );
    }
  };

  const approveDonation = async (donation: Donation) => {
    const amount = window.prompt(
      `Monto verificado para ${getDonorName(donation)}`,
      donation.amount ?? "",
    );
    if (amount === null) return;

    const confirmed = window.confirm(
      `Confirmas que el comprobante corresponde a una donacion de ${formatMoney(amount)}?`,
    );
    if (!confirmed) return;

    setActiveDonationAction(donation.id);
    try {
      const response = await fetch(
        `/api/admin/donations/${donation.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo aprobar");
      }

      toast.success("Donacion aprobada");
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo aprobar",
      );
    } finally {
      setActiveDonationAction(null);
    }
  };

  const rejectDonation = async (donation: Donation) => {
    if (
      !window.confirm(
        "Confirmas que queres rechazar esta donacion? Podras reabrirla mas adelante.",
      )
    ) {
      return;
    }

    setActiveDonationAction(donation.id);
    try {
      const response = await fetch(
        `/api/admin/donations/${donation.id}/reject`,
        { method: "POST" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo rechazar");
      }

      toast.success("Donacion rechazada");
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo rechazar",
      );
    } finally {
      setActiveDonationAction(null);
    }
  };

  const reopenDonation = async (donation: Donation) => {
    const confirmed = window.confirm(
      donation.status === "APPROVED"
        ? `Confirmas que queres reabrir esta donacion? Se quitara el monto ${formatMoney(donation.amount)} del progreso hasta que vuelva a aprobarse.`
        : "Confirmas que queres reabrir esta donacion rechazada para revisarla nuevamente?",
    );
    if (!confirmed) return;

    setOpenActionMenuId(null);
    setActiveDonationAction(donation.id);
    try {
      const response = await fetch(
        `/api/admin/donations/${donation.id}/reopen`,
        { method: "POST" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo reabrir");
      }

      toast.success("Donacion reabierta");
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo reabrir",
      );
    } finally {
      setActiveDonationAction(null);
    }
  };

  const openEditAmountDialog = (donation: Donation) => {
    setOpenActionMenuId(null);
    setEditingDonation(donation);
    setEditingAmount(donation.amount ?? "");
  };

  const updateDonationAmount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingDonation) return;

    const confirmed = window.confirm(
      `El monto registrado cambiara de ${formatMoney(editingDonation.amount)} a ${formatMoney(editingAmount)} y se actualizara el progreso de la campana.`,
    );
    if (!confirmed) return;

    setActiveDonationAction(editingDonation.id);
    try {
      const response = await fetch(
        `/api/admin/donations/${editingDonation.id}/amount`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: editingAmount }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo actualizar");
      }

      toast.success("Monto actualizado");
      setEditingDonation(null);
      setEditingAmount("");
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo actualizar",
      );
    } finally {
      setActiveDonationAction(null);
    }
  };

  const openReceipt = async (donation: Donation) => {
    setActiveDonationAction(donation.id);
    try {
      const response = await fetch(
        `/api/admin/donations/${donation.id}/receipt`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo abrir");
      }

      window.open(data.receipt.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo abrir");
    } finally {
      setActiveDonationAction(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
            <HeartHandshake className="h-4 w-4" />
            Campañas DEA
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950">
            Gestion de donaciones
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            Crea campañas, revisa comprobantes y carga el monto real al aprobar
            cada donacion.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={refreshAll}>
          <RefreshCcw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ProgressSummary
          title="Activa"
          value={activeCampaign?.institutionName ?? "Sin campaña activa"}
          detail={
            activeCampaign
              ? `${formatMoney(activeCampaign.progress?.approvedTotal)} de ${formatMoney(activeCampaign.goalAmount)}`
              : "Crea una campaña para publicar /donar"
          }
          icon={ShieldCheck}
        />
        <ProgressSummary
          title="Pendientes"
          value={String(
            campaigns.reduce(
              (total, campaign) =>
                total + (campaign.donationCounts?.pending ?? 0),
              0,
            ),
          )}
          detail="Comprobantes por revisar"
          icon={FileImage}
        />
        <ProgressSummary
          title="Aprobadas"
          value={String(
            campaigns.reduce(
              (total, campaign) =>
                total + (campaign.donationCounts?.approved ?? 0),
              0,
            ),
          )}
          detail="Donaciones con monto confirmado"
          icon={CircleDollarSign}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                {selectedCampaign ? "Editar campaña activa" : "Nueva campaña"}
              </h2>
              <p className="text-xs text-neutral-500">
                Solo puede existir una campaña activa.
              </p>
            </div>
            {selectedCampaign && (
              <Button variant="outline" size="sm" onClick={resetForm}>
                Nueva
              </Button>
            )}
          </div>

          <form className="grid gap-3" onSubmit={submitCampaign}>
            <Field label="Institucion">
              <Input
                value={form.institutionName}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    institutionName: event.target.value,
                  }))
                }
                required
                maxLength={120}
              />
            </Field>
            <Field label="Localidad">
              <Input
                value={form.locality}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    locality: event.target.value,
                  }))
                }
                required
                maxLength={80}
              />
            </Field>
            <Field label="Direccion">
              <Input
                value={form.address}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    address: event.target.value,
                  }))
                }
                required
                maxLength={180}
              />
            </Field>
            <Field label="Objetivo ARS">
              <Input
                value={form.goalAmount}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    goalAmount: event.target.value,
                  }))
                }
                required
                inputMode="decimal"
                placeholder="2500000"
              />
            </Field>
            <Field label={selectedCampaign ? "Nueva imagen" : "Imagen"}>
              <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-center text-sm transition-colors hover:border-rose-300 hover:bg-rose-50/70">
                <ImagePlus className="h-5 w-5 text-rose-700" />
                <span className="font-medium text-neutral-900">
                  {form.placeImage?.name ??
                    (selectedCampaign
                      ? "Mantener imagen actual"
                      : "Seleccionar imagen")}
                </span>
                <span className="text-xs text-neutral-500">
                  JPG, PNG o WEBP hasta 5MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) =>
                    setForm((state) => ({
                      ...state,
                      placeImage: event.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>
            </Field>
            <div className="flex gap-2 pt-2">
              <Button disabled={isSubmittingCampaign} className="gap-2">
                <Check className="h-4 w-4" />
                {isSubmittingCampaign
                  ? "Guardando..."
                  : selectedCampaign
                    ? "Guardar"
                    : "Crear"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpiar
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-neutral-200 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Campañas
              </h2>
              <p className="text-xs text-neutral-500">
                Progreso calculado con donaciones aprobadas.
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-[160px_240px]">
              <Select
                value={campaignStatus}
                onValueChange={(value) => {
                  setCampaignStatus(value);
                  setCampaignPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activas</SelectItem>
                  <SelectItem value="COMPLETED">Completadas</SelectItem>
                  <SelectItem value="ARCHIVED">Archivadas</SelectItem>
                </SelectContent>
              </Select>
              <SearchInput
                value={campaignSearch}
                onChange={(value) => {
                  setCampaignSearch(value);
                  setCampaignPage(1);
                }}
                placeholder="Buscar campaña"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {isLoadingCampaigns ? (
              <EmptyState text="Cargando campañas..." />
            ) : campaigns.length === 0 ? (
              <EmptyState text="No hay campañas para mostrar." />
            ) : (
              campaigns.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  selected={selectedCampaign?.id === campaign.id}
                  onEdit={() => selectCampaign(campaign)}
                  onComplete={() => updateCampaignStatus(campaign, "COMPLETED")}
                  onArchive={() => updateCampaignStatus(campaign, "ARCHIVED")}
                />
              ))
            )}
          </div>
          <PaginationControls
            page={campaignPage}
            totalPages={campaignTotalPages}
            onPageChange={setCampaignPage}
          />
        </section>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-neutral-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-950">
              Revision de donaciones
            </h2>
            <p className="text-xs text-neutral-500">
              El monto se ingresa al aprobar, despues de verificar el
              comprobante.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-[180px_220px_260px]">
            <Select
              value={donationStatus}
              onValueChange={(value) => {
                setDonationStatus(value);
                setDonationPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="APPROVED">Aprobadas</SelectItem>
                <SelectItem value="REJECTED">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={donationCampaignId}
              onValueChange={(value) => {
                setDonationCampaignId(value);
                setDonationPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Campaña" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las campañas</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={String(campaign.id)}>
                    {campaign.institutionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SearchInput
              value={donationSearch}
              onChange={(value) => {
                setDonationSearch(value);
                setDonationPage(1);
              }}
              placeholder="Buscar donante o archivo"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[960px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase text-neutral-500">
                <th className="border-b border-neutral-200 px-3 py-2">
                  Donante
                </th>
                <th className="border-b border-neutral-200 px-3 py-2">
                  Campaña
                </th>
                <th className="border-b border-neutral-200 px-3 py-2">Monto</th>
                <th className="border-b border-neutral-200 px-3 py-2">
                  Estado
                </th>
                <th className="border-b border-neutral-200 px-3 py-2">
                  Comprobante
                </th>
                <th className="border-b border-neutral-200 px-3 py-2">Fecha</th>
                <th className="border-b border-neutral-200 px-3 py-2 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingDonations ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center">
                    Cargando donaciones...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-neutral-500"
                  >
                    No hay donaciones para mostrar.
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <DonationRow
                    key={donation.id}
                    donation={donation}
                    isBusy={activeDonationAction === donation.id}
                    isMenuOpen={openActionMenuId === donation.id}
                    onApprove={() => approveDonation(donation)}
                    onReject={() => rejectDonation(donation)}
                    onReceipt={() => openReceipt(donation)}
                    onReopen={() => reopenDonation(donation)}
                    onEditAmount={() => openEditAmountDialog(donation)}
                    onToggleMenu={() =>
                      setOpenActionMenuId((current) =>
                        current === donation.id ? null : donation.id,
                      )
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          page={donationPage}
          totalPages={donationTotalPages}
          onPageChange={setDonationPage}
        />
      </section>

      <EditDonationAmountDialog
        donation={editingDonation}
        amount={editingAmount}
        isBusy={
          editingDonation !== null && activeDonationAction === editingDonation.id
        }
        onAmountChange={setEditingAmount}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDonation(null);
            setEditingAmount("");
          }
        }}
        onReceipt={editingDonation ? () => openReceipt(editingDonation) : undefined}
        onSubmit={updateDonationAmount}
      />

      <Toaster />
    </div>
  );
}

function ProgressSummary({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-neutral-500">{title}</span>
        <Icon className="h-4 w-4 text-rose-700" />
      </div>
      <p className="mt-2 truncate text-xl font-semibold text-neutral-950">
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function CampaignRow({
  campaign,
  selected,
  onEdit,
  onComplete,
  onArchive,
}: {
  campaign: Campaign;
  selected: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onArchive: () => void;
}) {
  const progress = campaign.progress?.visualPercentage ?? 0;

  return (
    <div
      className={cn(
        "grid gap-3 rounded-md border border-neutral-200 p-3 transition-colors lg:grid-cols-[120px_1fr_auto]",
        selected && "border-rose-300 bg-rose-50/60",
      )}
    >
      <div className="relative h-24 overflow-hidden rounded-md bg-neutral-100">
        <Image
          src={campaign.placeImageUrl}
          alt={campaign.institutionName}
          fill
          className="object-cover"
          sizes="120px"
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-neutral-950">
            {campaign.institutionName}
          </h3>
          <Badge variant="outline" className={statusClass(campaign.status)}>
            {statusLabel(campaign.status)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          {campaign.locality} - {campaign.address}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-rose-600"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
          <span>
            {formatMoney(campaign.progress?.approvedTotal)} /{" "}
            {formatMoney(campaign.goalAmount)}
          </span>
          <span>{campaign.progress?.visualPercentage ?? 0}%</span>
          <span>{campaign.donationCounts?.pending ?? 0} pendientes</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        {campaign.status === "ACTIVE" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onComplete}
          >
            <Check className="h-4 w-4" />
            Completar
          </Button>
        )}
        {campaign.status !== "ARCHIVED" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
            onClick={onArchive}
          >
            <Archive className="h-4 w-4" />
            Archivar
          </Button>
        )}
      </div>
    </div>
  );
}

function DonationRow({
  donation,
  isBusy,
  isMenuOpen,
  onApprove,
  onReject,
  onReceipt,
  onReopen,
  onEditAmount,
  onToggleMenu,
}: {
  donation: Donation;
  isBusy: boolean;
  isMenuOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReceipt: () => void;
  onReopen: () => void;
  onEditAmount: () => void;
  onToggleMenu: () => void;
}) {
  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="border-b border-neutral-100 px-3 py-3 align-top">
        <div className="font-medium text-neutral-950">
          {getDonorName(donation)}
        </div>
        <div className="text-xs text-neutral-500">
          {donation.email ?? "Sin email"} ·{" "}
          {donation.isAnonymous ? "Anonima" : "Publica"}
        </div>
      </td>
      <td className="border-b border-neutral-100 px-3 py-3 align-top">
        <div className="max-w-56 truncate font-medium text-neutral-800">
          {donation.campaign?.institutionName ?? `#${donation.campaignId}`}
        </div>
        <div className="text-xs text-neutral-500">
          {donation.campaign?.locality ?? ""}
        </div>
      </td>
      <td className="border-b border-neutral-100 px-3 py-3 align-top font-medium">
        {formatMoney(donation.amount)}
      </td>
      <td className="border-b border-neutral-100 px-3 py-3 align-top">
        <Badge variant="outline" className={statusClass(donation.status)}>
          {statusLabel(donation.status)}
        </Badge>
      </td>
      <td className="border-b border-neutral-100 px-3 py-3 align-top">
        <button
          type="button"
          onClick={onReceipt}
          disabled={isBusy}
          className="max-w-44 truncate text-left text-sm font-medium text-rose-700 underline-offset-4 hover:underline disabled:opacity-50"
        >
          {donation.receiptOriginalName ?? "Ver comprobante"}
        </button>
        <div className="text-xs text-neutral-500">
          {fileSize(donation.receiptBytes)}
        </div>
      </td>
      <td className="border-b border-neutral-100 px-3 py-3 align-top text-neutral-600">
        {formatDate(donation.createdAt)}
      </td>
      <td className="border-b border-neutral-100 px-3 py-3 align-top">
        <div className="flex justify-end gap-2">
          {donation.status === "PENDING" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isBusy}
                onClick={onReceipt}
              >
                <FileImage className="h-4 w-4" />
                Ver
              </Button>
              <Button
                size="sm"
                className="gap-2"
                disabled={isBusy}
                onClick={onApprove}
              >
                <Check className="h-4 w-4" />
                Aprobar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                disabled={isBusy}
                onClick={onReject}
              >
                <X className="h-4 w-4" />
                Rechazar
              </Button>
            </>
          ) : (
            <div className="relative flex items-center justify-end gap-2">
              <span className="text-xs text-neutral-500">
                Revisada {formatDate(donation.reviewedAt)}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={isBusy}
                onClick={onToggleMenu}
                aria-label="Acciones de donacion"
                aria-expanded={isMenuOpen}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-md border border-neutral-200 bg-white py-1 text-left shadow-lg">
                  <ActionMenuButton onClick={onReceipt} disabled={isBusy}>
                    <FileImage className="h-4 w-4" />
                    Ver comprobante
                  </ActionMenuButton>
                  {donation.status === "APPROVED" && (
                    <ActionMenuButton onClick={onEditAmount} disabled={isBusy}>
                      <Pencil className="h-4 w-4" />
                      Editar monto
                    </ActionMenuButton>
                  )}
                  <ActionMenuButton onClick={onReopen} disabled={isBusy}>
                    <RotateCcw className="h-4 w-4" />
                    Reabrir revision
                  </ActionMenuButton>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function ActionMenuButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function EditDonationAmountDialog({
  donation,
  amount,
  isBusy,
  onAmountChange,
  onOpenChange,
  onReceipt,
  onSubmit,
}: {
  donation: Donation | null;
  amount: string;
  isBusy: boolean;
  onAmountChange: (amount: string) => void;
  onOpenChange: (open: boolean) => void;
  onReceipt?: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const currentAmount = parseMoneyForPreview(donation?.amount);
  const nextAmount = parseMoneyForPreview(amount);
  const difference =
    currentAmount !== null && nextAmount !== null ? nextAmount - currentAmount : null;
  const absoluteDifference =
    difference !== null ? Math.abs(difference).toFixed(2) : null;
  const campaignImpact =
    difference === null
      ? "Ingresa un monto valido para ver el impacto en la campana."
      : difference === 0
        ? "La campana no cambiara su total aprobado."
        : difference > 0
          ? `La campana aumentara ${formatMoney(absoluteDifference)}.`
          : `La campana disminuira ${formatMoney(absoluteDifference)}.`;

  return (
    <Dialog open={Boolean(donation)} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-auto max-h-[90svh] max-w-xl overflow-y-auto rounded-lg bg-white p-6"
        closeButtonClassName="[&_svg]:h-5 [&_svg]:w-5 [&_svg]:bg-transparent [&_svg]:text-neutral-700"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-950">
            Editar monto
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-neutral-600">
            Corregi el monto aprobado sin cambiar el comprobante ni los datos de
            la donacion.
          </DialogDescription>
        </DialogHeader>

        {donation && (
          <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-neutral-500">
                    Comprobante
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-neutral-950">
                    {donation.receiptOriginalName ?? "Ver comprobante"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {fileSize(donation.receiptBytes)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={isBusy || !onReceipt}
                  onClick={onReceipt}
                >
                  <FileImage className="h-4 w-4" />
                  Abrir
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-neutral-200 p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">
                  Monto registrado
                </p>
                <p className="mt-2 text-lg font-semibold text-neutral-950">
                  {formatMoney(donation.amount)}
                </p>
              </div>
              <Field label="Nuevo monto">
                <Input
                  value={amount}
                  onChange={(event) => onAmountChange(event.target.value)}
                  required
                  inputMode="decimal"
                  placeholder="3000"
                />
              </Field>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              {campaignImpact}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isBusy} className="gap-2">
                <Check className="h-4 w-4" />
                {isBusy ? "Guardando..." : "Guardar monto"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-neutral-700">{label}</Label>
      {children}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
        placeholder={placeholder}
      />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
      {text}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-neutral-600">
      <span>
        Pagina {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
