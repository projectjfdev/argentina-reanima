"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/libs/utils";
import {
  Edit3,
  ExternalLink,
  FileBadge,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import {
  CertificatePreview,
  type CertificatePreviewData,
} from "./CertificatePreview";

type CertificateFormValues = {
  recipientName: string;
  recipientEmail: string;
  recipientDni: string;
  certificateText: string;
  footerText: string;
  serialNumber: string;
};

type CertificateListItem = CertificateFormValues & {
  publicId: string;
  recipientEmailNormalized: string;
  status: "ACTIVE" | "DELETED";
  publicUrl: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

const EMPTY_FORM_VALUES: CertificateFormValues = {
  recipientName: "",
  recipientEmail: "",
  recipientDni: "",
  certificateText: "",
  footerText: "",
  serialNumber: "",
};

function getTextPreview(value: string) {
  return value.length > 160 ? `${value.slice(0, 160)}...` : value;
}

export function CertificatesDashboard() {
  const [certificates, setCertificates] = useState<CertificateListItem[]>([]);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateListItem | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });

  const watchedValues = watch();
  const previewData: CertificatePreviewData = useMemo(
    () => ({
      ...watchedValues,
      publicId: selectedCertificate?.publicId,
      publicUrl: selectedCertificate?.publicUrl,
    }),
    [
      selectedCertificate?.publicId,
      selectedCertificate?.publicUrl,
      watchedValues,
    ],
  );

  const loadCertificates = useCallback(async () => {
    setIsLoadingList(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: "6",
        status: "ACTIVE",
      });

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const response = await fetch(`/api/certificates?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al cargar");
      }

      setCertificates(data.certificates || []);
      setTotalPages(Math.max(data.totalPages || 1, 1));
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los certificados");
    } finally {
      setIsLoadingList(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleResetForm = () => {
    setSelectedCertificate(null);
    reset(EMPTY_FORM_VALUES);
  };

  const handleSelectCertificate = (certificate: CertificateListItem) => {
    setSelectedCertificate(certificate);
    reset({
      recipientName: certificate.recipientName,
      recipientEmail: certificate.recipientEmail,
      recipientDni: certificate.recipientDni,
      certificateText: certificate.certificateText,
      footerText: certificate.footerText,
      serialNumber: certificate.serialNumber,
    });
  };

  const onSubmit = async (values: CertificateFormValues) => {
    setIsSubmitting(true);

    try {
      const url = selectedCertificate
        ? `/api/certificates/${selectedCertificate.publicId}`
        : "/api/certificates";
      const method = selectedCertificate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al guardar");
      }

      toast.success(
        selectedCertificate ? "Certificado actualizado" : "Certificado creado",
      );
      handleResetForm();
      await loadCertificates();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el certificado",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (certificate: CertificateListItem) => {
    const confirmed = window.confirm(
      `Eliminar el certificado ${certificate.serialNumber}?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/certificates/${certificate.publicId}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al eliminar");
      }

      if (selectedCertificate?.publicId === certificate.publicId) {
        handleResetForm();
      }

      toast.success("Certificado eliminado");
      await loadCertificates();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el certificado",
      );
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <FileBadge className="h-4 w-4" />
          Certificados
        </div>
        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950">
              Emisión administrativa
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-600">
              Completá los datos del certificado y revisá la vista previa antes
              de guardarlo.
            </p>
          </div>

          {selectedCertificate && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResetForm}
              className="w-full gap-2 xl:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Nuevo certificado
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.95fr)_minmax(420px,1.05fr)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                {selectedCertificate
                  ? "Editar certificado"
                  : "Nuevo certificado"}
              </h2>
              <p className="text-xs text-neutral-500">
                El QR definitivo aparece al crear o editar un certificado
                guardado.
              </p>
            </div>
            {selectedCertificate && (
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-50 text-amber-700"
              >
                Editando
              </Badge>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nombre" error={errors.recipientName?.message}>
              <Input
                {...register("recipientName", {
                  required: "El nombre es obligatorio",
                })}
                placeholder="Nombre completo"
              />
            </Field>

            <Field label="Email" error={errors.recipientEmail?.message}>
              <Input
                type="email"
                {...register("recipientEmail", {
                  required: "El email es obligatorio",
                })}
                placeholder="persona@email.com"
              />
            </Field>

            <Field label="DNI" error={errors.recipientDni?.message}>
              <Input
                {...register("recipientDni", {
                  required: "El DNI es obligatorio",
                })}
                placeholder="00.000.000"
              />
            </Field>

            <Field label="Numero de serie" error={errors.serialNumber?.message}>
              <Input
                {...register("serialNumber", {
                  required: "El numero de serie es obligatorio",
                })}
                placeholder="AR-2026-0001"
              />
            </Field>
          </div>

          <Field
            label="Texto principal del certificado"
            error={errors.certificateText?.message}
            className="mt-3"
          >
            <Textarea
              rows={6}
              {...register("certificateText", {
                required: "El texto principal es obligatorio",
              })}
              placeholder="Se deja constancia que..."
            />
          </Field>

          <Field
            label="Texto inferior / aclaracion"
            error={errors.footerText?.message}
            className="mt-3"
          >
            <Textarea
              rows={4}
              {...register("footerText", {
                required: "El texto inferior es obligatorio",
              })}
              placeholder="La presente actividad tuvo caracter..."
            />
          </Field>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <FileBadge className="h-4 w-4" />
              {isSubmitting
                ? "Guardando..."
                : selectedCertificate
                  ? "Guardar cambios"
                  : "Crear certificado"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetForm}
              disabled={isSubmitting}
            >
              Limpiar
            </Button>
          </div>
        </form>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Vista previa
              </h2>
              <p className="text-xs text-neutral-500">
                Así se verá el certificado con los datos cargados.
              </p>
            </div>
          </div>
          <CertificatePreview data={previewData} />
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-neutral-200 pb-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-950">
              Certificados emitidos
            </h2>
            <p className="text-xs text-neutral-500">
              Se muestran certificados activos.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
              placeholder="Buscar por nombre, DNI, texto o serie"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {isLoadingList ? (
            <div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
              Cargando certificados...
            </div>
          ) : certificates.length === 0 ? (
            <div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
              No hay certificados activos para mostrar.
            </div>
          ) : (
            certificates.map((certificate) => (
              <div
                key={certificate.publicId}
                className={cn(
                  "grid gap-3 rounded-md border border-neutral-200 p-3 transition-colors md:grid-cols-[1fr_auto]",
                  selectedCertificate?.publicId === certificate.publicId &&
                    "border-emerald-300 bg-emerald-50/70",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-neutral-950">
                      {certificate.recipientName}
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                      Activo
                    </Badge>
                    {certificate.user && (
                      <Badge
                        variant="outline"
                        className="border-sky-200 bg-sky-50 text-sky-700"
                      >
                        Usuario vinculado
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-700">
                    {getTextPreview(certificate.certificateText)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>{certificate.recipientEmailNormalized}</span>
                    <span>DNI {certificate.recipientDni}</span>
                    <span>Serie {certificate.serialNumber}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCertificate(certificate)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a
                      href={certificate.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCertificate(certificate)}
                    className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-neutral-600">
          <span>
            Pagina {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-neutral-700">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
