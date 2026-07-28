"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER,
  CERTIFICATE_INSTRUCTORS,
  CERTIFICATE_TEMPLATES,
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
  certificateTextHasRecipientNamePlaceholder,
  getCertificateInstructorByKey,
  getCertificateTemplateByKey,
  renderCertificateTextTemplate,
  type CertificateTemplateKey,
} from "@/libs/certificates";
import { cn } from "@/libs/utils";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileBadge,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
  templateKey: CertificateTemplateKey;
  instructorSignatureEnabled: boolean;
  instructorKey: string;
};

type CertificateMode = "single" | "bulk";

type BulkPreviewRow = {
  rowNumber: number;
  recipientName: string;
  recipientEmail: string;
  recipientEmailNormalized: string;
};

type BulkImportError = {
  rowNumber: number;
  field: "Nombre" | "Email";
  message: string;
};

type BulkValidationResult = {
  message?: string;
  rowCount?: number;
  validRowCount?: number;
  errorCount?: number;
  createdCount?: number;
  serialRange?: {
    from: string;
    to: string;
  };
  missingColumns?: string[];
  errors?: BulkImportError[];
  previewRows?: BulkPreviewRow[];
  success: boolean;
};

type CertificateListItem = Omit<
  CertificateFormValues,
  "instructorKey" | "recipientDni"
> & {
  instructorKey: string | null;
  recipientDni: string | null;
  serialNumber: string;
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
  certificateText: DEFAULT_CERTIFICATE_TEXT_TEMPLATE,
  footerText: "",
  templateKey: DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  instructorSignatureEnabled: false,
  instructorKey: CERTIFICATE_INSTRUCTORS[0].key,
};

const DEFAULT_CERTIFICATE_INSTRUCTOR_KEY =
  CERTIFICATE_INSTRUCTORS[0]?.key ?? "";

type CertificateSubmitPayload = Omit<CertificateFormValues, "instructorKey"> & {
  instructorKey: string | null;
};

function getValidInstructorKey(value: string | null | undefined) {
  return getCertificateInstructorByKey(value) ? (value ?? "") : "";
}

function getDefaultedInstructorKey(value: string | null | undefined) {
  return getValidInstructorKey(value) || DEFAULT_CERTIFICATE_INSTRUCTOR_KEY;
}

function normalizeCertificateFormValues(
  values: CertificateFormValues,
): CertificateSubmitPayload {
  const instructorKey = values.instructorSignatureEnabled
    ? getDefaultedInstructorKey(values.instructorKey)
    : null;

  return {
    ...values,
    instructorKey,
  };
}

function getTextPreview(value: string) {
  return value.length > 160 ? `${value.slice(0, 160)}...` : value;
}

function getTemplateName(templateKey: string) {
  return getCertificateTemplateByKey(templateKey)?.name ?? "Plantilla 1";
}

export function CertificatesDashboard() {
  const [certificates, setCertificates] = useState<CertificateListItem[]>([]);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateListItem | null>(null);
  const [certificateMode, setCertificateMode] =
    useState<CertificateMode>("single");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkFileName, setBulkFileName] = useState("");
  const [bulkValidation, setBulkValidation] =
    useState<BulkValidationResult | null>(null);
  const [isValidatingBulkFile, setIsValidatingBulkFile] = useState(false);
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
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
    shouldUnregister: true,
  });

  const watchedValues = watch();
  const watchedInstructorSignatureEnabled =
    watchedValues.instructorSignatureEnabled ?? false;
  const watchedInstructorKey = watchedValues.instructorKey ?? "";
  const bulkPreviewRecipientName =
    bulkValidation?.previewRows?.[0]?.recipientName || "Nombre de ejemplo";
  const previewData: CertificatePreviewData = useMemo(
    () => ({
      ...watchedValues,
      recipientName:
        certificateMode === "bulk"
          ? bulkPreviewRecipientName
          : watchedValues.recipientName,
      recipientEmail:
        certificateMode === "bulk"
          ? "participantes@archivo.xlsx"
          : watchedValues.recipientEmail,
      recipientDni:
        certificateMode === "bulk" ? null : watchedValues.recipientDni,
      serialNumber: selectedCertificate?.serialNumber,
      publicId: selectedCertificate?.publicId,
      publicUrl: selectedCertificate?.publicUrl,
    }),
    [
      bulkPreviewRecipientName,
      certificateMode,
      selectedCertificate?.publicId,
      selectedCertificate?.publicUrl,
      selectedCertificate?.serialNumber,
      watchedValues,
    ],
  );

  const loadCertificates = useCallback(
    async (pageOverride?: number) => {
      setIsLoadingList(true);

      try {
        const pageToLoad = pageOverride ?? currentPage;
        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          pageSize: "6",
          status: "ACTIVE",
        });

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }

        const response = await fetch(`/api/certificates?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Error al cargar");
        }

        if (pageOverride) {
          setCurrentPage(pageOverride);
        }

        setCertificates(data.certificates || []);
        setTotalPages(Math.max(data.totalPages || 1, 1));
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los certificados");
      } finally {
        setIsLoadingList(false);
      }
    },
    [currentPage, debouncedSearch],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  useEffect(() => {
    if (
      watchedInstructorSignatureEnabled &&
      DEFAULT_CERTIFICATE_INSTRUCTOR_KEY &&
      !getCertificateInstructorByKey(watchedInstructorKey)
    ) {
      setValue("instructorKey", DEFAULT_CERTIFICATE_INSTRUCTOR_KEY, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [setValue, watchedInstructorKey, watchedInstructorSignatureEnabled]);

  const handleResetForm = () => {
    setSelectedCertificate(null);
    setCertificateMode("single");
    setBulkFile(null);
    setBulkFileName("");
    setBulkValidation(null);
    reset(EMPTY_FORM_VALUES);
  };

  const handleSelectCertificate = (certificate: CertificateListItem) => {
    setSelectedCertificate(certificate);
    setCertificateMode("single");
    setBulkFile(null);
    setBulkFileName("");
    setBulkValidation(null);
    const hasObsoleteInstructorKey = Boolean(
      certificate.instructorSignatureEnabled &&
      certificate.instructorKey &&
      !getCertificateInstructorByKey(certificate.instructorKey),
    );
    const instructorKey =
      certificate.instructorKey ?? DEFAULT_CERTIFICATE_INSTRUCTOR_KEY;

    reset({
      recipientName: certificate.recipientName,
      recipientEmail: certificate.recipientEmail,
      recipientDni: certificate.recipientDni ?? "",
      certificateText: certificate.certificateText,
      footerText: certificate.footerText,
      templateKey: certificate.templateKey ?? DEFAULT_CERTIFICATE_TEMPLATE_KEY,
      instructorSignatureEnabled:
        certificate.instructorSignatureEnabled ?? false,
      instructorKey,
    });

    if (hasObsoleteInstructorKey && DEFAULT_CERTIFICATE_INSTRUCTOR_KEY) {
      setValue("instructorKey", DEFAULT_CERTIFICATE_INSTRUCTOR_KEY, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleValidateBulkFile = useCallback(
    async (file = bulkFile) => {
      if (!file) {
        toast.error("Selecciona un archivo .xlsx");
        return;
      }

      setIsValidatingBulkFile(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/certificates/bulk", {
          cache: "no-store",
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as BulkValidationResult;

        setBulkValidation(data);

        if (!response.ok && !data.errors && !data.missingColumns) {
          throw new Error(data.message || "No se pudo validar el archivo");
        }

        if (data.success) {
          toast.success("Archivo validado correctamente");
        } else {
          toast.warning(data.message || "El archivo tiene errores");
        }
      } catch (error) {
        console.error(error);
        setBulkValidation(null);
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo validar el archivo",
        );
      } finally {
        setIsValidatingBulkFile(false);
      }
    },
    [bulkFile],
  );

  const handleBulkFileChange = (file: File | null) => {
    setBulkFile(file);
    setBulkFileName(file?.name ?? "");
    setBulkValidation(null);

    if (file) {
      void handleValidateBulkFile(file);
    }
  };

  const handleCreateBulkCertificates = async (
    values: CertificateFormValues,
  ) => {
    if (!bulkFile) {
      toast.error("Selecciona un archivo .xlsx");
      return;
    }

    if (bulkValidation && !bulkValidation.success) {
      toast.error("Corregi los errores del archivo antes de crear el lote");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("intent", "create");
      formData.append("file", bulkFile);
      const payload = normalizeCertificateFormValues(values);

      formData.append("certificateText", payload.certificateText);
      formData.append("footerText", payload.footerText);
      formData.append("templateKey", payload.templateKey);
      formData.append(
        "instructorSignatureEnabled",
        String(payload.instructorSignatureEnabled),
      );
      formData.append("instructorKey", payload.instructorKey ?? "");

      const response = await fetch("/api/certificates/bulk", {
        cache: "no-store",
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as BulkValidationResult;

      if (!response.ok) {
        setBulkValidation(data);
        throw new Error(data.message || "No se pudo crear el lote");
      }

      toast.success(
        data.serialRange
          ? `${data.createdCount} certificados creados (${data.serialRange.from} a ${data.serialRange.to})`
          : `${data.createdCount} certificados creados`,
      );
      handleResetForm();
      await loadCertificates(1);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo crear el lote de certificados",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: CertificateFormValues) => {
    if (certificateMode === "bulk") {
      await handleCreateBulkCertificates(values);
      return;
    }

    setIsSubmitting(true);

    try {
      const url = selectedCertificate
        ? `/api/certificates/${selectedCertificate.publicId}`
        : "/api/certificates";
      const method = selectedCertificate ? "PUT" : "POST";

      const response = await fetch(url, {
        cache: "no-store",
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizeCertificateFormValues(values)),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al guardar");
      }

      toast.success(
        selectedCertificate ? "Certificado actualizado" : "Certificado creado",
      );
      handleResetForm();
      await loadCertificates(1);
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
          cache: "no-store",
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
          <div className="mb-4 grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
            <ModeButton
              active={certificateMode === "single"}
              icon={UserRound}
              label="Individual"
              onClick={() => setCertificateMode("single")}
            />
            <ModeButton
              active={certificateMode === "bulk"}
              disabled={Boolean(selectedCertificate)}
              icon={FileSpreadsheet}
              label="Excel"
              onClick={() => {
                setCertificateMode("bulk");
                setBulkFile(null);
                setBulkFileName("");
                setBulkValidation(null);
                reset({
                  ...watchedValues,
                  recipientName: "",
                  recipientEmail: "",
                  recipientDni: "",
                });
              }}
            />
          </div>
          {certificateMode === "single" ? (
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

              <Field
                label="DNI (Opcional)"
                error={errors.recipientDni?.message}
              >
                <Input {...register("recipientDni")} placeholder="00.000.000" />
              </Field>
            </div>
          ) : (
            <Field label="Archivo Excel">
              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50/60">
                <FileSpreadsheet className="h-6 w-6 text-emerald-700" />
                <span className="text-sm font-medium text-neutral-900">
                  {bulkFileName || "Seleccionar archivo .xlsx"}
                </span>
                <span className="text-xs text-neutral-500">
                  Columnas esperadas: Email y Nombre
                </span>
                <input
                  type="file"
                  accept=".xlsx"
                  className="sr-only"
                  onChange={(event) =>
                    handleBulkFileChange(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <BulkValidationSummary
                result={bulkValidation}
                isLoading={isValidatingBulkFile}
              />
            </Field>
          )}
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            {selectedCertificate
              ? `Número de serie: ${selectedCertificate.serialNumber}`
              : "El número de serie se asigna automaticamente al guardar."}
          </p>
          {/* Fecha de vencimiento: <input type="date" /> */}
          <Field
            label="Plantilla"
            error={errors.templateKey?.message}
            className="mt-3"
          >
            <Controller
              name="templateKey"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATE_TEMPLATES.map((template) => (
                      <SelectItem key={template.key} value={template.key}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field
            label="Texto principal del certificado"
            error={errors.certificateText?.message}
            className="mt-3"
          >
            <Textarea
              rows={6}
              {...register("certificateText", {
                required: "El texto principal es obligatorio",
                validate: (value) =>
                  certificateTextHasRecipientNamePlaceholder(value) ||
                  `El texto debe conservar ${CERTIFICATE_RECIPIENT_NAME_PLACEHOLDER}`,
              })}
              placeholder="Se deja constancia que..."
            />
            <p className="mt-1 text-xs text-neutral-500">
              El nombre del participante se insertara automaticamente.
            </p>
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
          <div className="mt-3 rounded-md border border-neutral-200 p-3">
            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                {...register("instructorSignatureEnabled")}
              />
              <span>
                <span className="block font-medium text-neutral-900">
                  Agregar firma de instructor
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  La firma y el nombre se toman automaticamente del instructor
                  seleccionado.
                </span>
              </span>
            </label>

            <Field
              label="Instructor"
              error={errors.instructorKey?.message}
              className="mt-3"
            >
              <Controller
                name="instructorKey"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={!watchedInstructorSignatureEnabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_INSTRUCTORS.map((instructor) => (
                        <SelectItem key={instructor.key} value={instructor.key}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={isSubmitting || isValidatingBulkFile}
              className="gap-2"
            >
              <FileBadge className="h-4 w-4" />
              {isSubmitting || isValidatingBulkFile
                ? certificateMode === "bulk"
                  ? "Validando..."
                  : "Guardando..."
                : selectedCertificate
                  ? "Guardar cambios"
                  : certificateMode === "bulk"
                    ? "Crear lote"
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
              placeholder="Buscar por nombre, email, texto o serie"
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
                    <Badge
                      variant="outline"
                      className="border-neutral-200 bg-neutral-50 text-neutral-700"
                    >
                      {getTemplateName(certificate.templateKey)}
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
                    {getTextPreview(
                      renderCertificateTextTemplate(
                        certificate.certificateText,
                        certificate.recipientName,
                      ),
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>{certificate.recipientEmailNormalized}</span>
                    {certificate.recipientDni && (
                      <span>DNI {certificate.recipientDni}</span>
                    )}
                    <span>Número de serie: {certificate.serialNumber}</span>
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

function BulkValidationSummary({
  result,
  isLoading,
}: {
  result: BulkValidationResult | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="mt-3 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">
        Validando archivo...
      </div>
    );
  }

  if (!result) return null;

  if (result.missingColumns?.length) {
    return (
      <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" />
          Faltan columnas obligatorias
        </div>
        <p className="mt-1 text-xs">
          Agrega: {result.missingColumns.join(", ")}.
        </p>
      </div>
    );
  }

  if (result.errors?.length) {
    return (
      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" />
          {result.errorCount} errores en {result.rowCount} filas
        </div>
        <ul className="mt-2 grid gap-1 text-xs">
          {result.errors.slice(0, 8).map((error, index) => (
            <li key={`${error.rowNumber}-${error.field}-${index}`}>
              Fila {error.rowNumber}, {error.field}: {error.message}
            </li>
          ))}
        </ul>
        {result.errors.length > 8 && (
          <p className="mt-2 text-xs">
            Y {result.errors.length - 8} errores mas.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
      <div className="flex items-center gap-2 font-semibold">
        <CheckCircle2 className="h-4 w-4" />
        {result.validRowCount} filas validas
      </div>
      {result.previewRows && result.previewRows.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-md border border-emerald-200 bg-white">
          <div className="grid grid-cols-[64px_1fr_1fr] gap-2 border-b border-emerald-100 px-2 py-1.5 text-xs font-semibold text-emerald-900">
            <span>Fila</span>
            <span>Nombre</span>
            <span>Email</span>
          </div>
          {result.previewRows.map((row) => (
            <div
              key={row.rowNumber}
              className="grid grid-cols-[64px_1fr_1fr] gap-2 px-2 py-1.5 text-xs text-neutral-700"
            >
              <span>{row.rowNumber}</span>
              <span className="truncate">{row.recipientName}</span>
              <span className="truncate">{row.recipientEmailNormalized}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "bg-white text-neutral-950 shadow-sm"
          : "text-neutral-600 hover:bg-white/70 hover:text-neutral-950",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
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
