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
import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Copy,
  FileText,
  Heart,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import Image from "next/image";
import {
  useState,
  type ComponentType,
  type FormEvent,
  type ReactNode,
} from "react";
import { Toaster, toast } from "sonner";

const progress = 62;
const raised = "$1.250.000";
const goal = "$2.000.000";
const updateDate = "01/07/2026";
const bankData = {
  banco: "Banco Ejemplo",
  alias: "ARGENTINA.REANIMA.DEA",
  cbu: "0000003100098765432101",
  cuenta: "000987654321",
  razonSocial: "Argentina Reanima Asociacion Civil",
  cuit: "30-00000000-0",
};

const statCards = [
  {
    icon: ReceiptText,
    label: "Total recaudado",
    value: raised,
  },
  {
    icon: CalendarDays,
    label: "Ultima actualizacion",
    value: updateDate,
  },
  {
    icon: Users,
    label: "Cantidad de donantes",
    value: "128 personas",
  },
];

export default function DonarPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      toast.error(`No pudimos copiar el ${label}`);
    }
  };

  const handleSubmitDonation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const receipt = formData.get("receipt");

    if (
      !formData.get("name") ||
      !formData.get("lastname") ||
      !formData.get("email") ||
      !(receipt instanceof File) ||
      receipt.size === 0
    ) {
      toast.error("Completa todos los campos para enviar el comprobante.");
      return;
    }

    toast.success("¡Muchas gracias por tu donación!", {
      description: "Recibimos tu comprobante y lo revisaremos a la brevedad.",
      duration: 10000,
    });
    form.reset();
    setSelectedFileName("");
    setIsDialogOpen(false);
  };

  return (
    <main className="bg-white text-slate-950">
      <section className="relative isolate min-h-[88svh] overflow-hidden bg-slate-950 pt-24">
        <Image
          src="/images/4.jpeg"
          alt="Capacitacion de Argentina Reanima"
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
              Campaña de donacion
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Un DEA puede marcar la diferencia entre la vida y la muerte.
            </h1>
            <p className="mt-5 text-2xl font-semibold text-primary md:text-4xl">
              Hoy podes ayudar a instalar uno.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
              La campaña busca recaudar fondos para instalar un DEA en un club,
              escuela o espacio publico. Cuando se llegue al objetivo, se
              instala el DEA y se capacita gratis.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 bg-primary px-6 text-white hover:bg-primary/90"
            >
              <a href="#donar">
                Donar ahora <Heart className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
            className="rounded-lg border border-white/20 bg-white/90 p-5 shadow-2xl shadow-black/25 backdrop-blur md:p-6"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
              <Target className="h-4 w-4" />
              Campaña en curso
            </div>
            <p className="text-sm font-medium text-slate-500">
              Club / Escuela / Espacio publico
            </p>
            <div className="mt-5">
              <p className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                {raised}
              </p>
              <p className="mt-2 text-lg text-slate-600">
                recaudados de {goal}
              </p>
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-600">Avance de la campaña</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="mt-5 flex gap-3 text-sm leading-6 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              Cuando lleguemos al objetivo, instalamos el DEA y capacitamos
              gratis.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-24">
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
                clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
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
              style={{ left: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="absolute right-5 top-5 max-w-[230px] rounded-lg border border-slate-200 bg-white/95 p-4 text-sm leading-6 shadow-lg backdrop-blur">
            Hasta ahora hay un{" "}
            <span className="text-xl font-semibold text-primary">
              {progress}%
            </span>{" "}
            de preparacion para salvar vidas en este lugar.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.42, ease: "easeOut", delay: 0.06 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Campaña en curso
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            Cada donacion acerca al lugar a estar preparado.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            El avance visual del DEA muestra el porcentaje de recaudacion. La
            parte en color representa lo que ya se logro; la parte en blanco y
            negro, lo que falta completar.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoPoint text="100% destinado a compra de DEA" />
            <InfoPoint text="Publicamos factura y entrega" />
          </div>
        </motion.div>
      </section>

      <section className="bg-slate-50 px-4 py-16 md:py-24">
        <div className="container mx-auto grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-stretch">
          <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:min-h-[420px]">
            <Image
              src="/images/club.jpg"
              alt="Club seleccionado para la campaña de instalacion de DEA"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/58 to-slate-950/18" />
            <div className="absolute inset-0 bg-slate-950/18" />
            <div className="relative z-10 flex h-full flex-col justify-end">
              <MapPin className="mb-5 h-9 w-9 text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" />
              <p className="max-w-xl text-lg font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                Este lugar hoy no tiene DEA.
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] md:text-5xl">
                Entre todos podemos cambiarlo.
              </h2>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <card.icon className="mb-5 h-7 w-7 text-primary" />
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {card.value}
                  </p>
                </div>
              ))}
              <a
                href="#detalle"
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <ArrowRight className="mb-5 h-7 w-7 text-primary transition group-hover:translate-x-1" />
                <p className="text-sm font-semibold text-primary">
                  Ver detalle
                </p>
                <p className="mt-2 text-base text-slate-600">
                  Conoce como vamos avanzando.
                </p>
              </a>
            </div>

            <div
              id="detalle"
              className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"
            >
              <TransparencyItem
                icon={ShieldCheck}
                text="100% destinado a compra de DEA"
              />
              <TransparencyItem
                icon={FileText}
                text="Publicamos factura y entrega"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="donar" className="px-4 py-16 md:py-24">
        <div className="container mx-auto rounded-lg border border-primary/20 bg-primary/5 p-6 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <Heart className="mb-5 h-10 w-10 text-primary" />
              <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
                No esperes a que pase. Ayudanos a estar preparados.
              </h2>
            </div>
            <Button
              size="lg"
              className="h-12 w-full bg-primary px-8 text-white hover:bg-primary/90 md:w-auto"
              onClick={() => setIsDialogOpen(true)}
            >
              Donar ahora <Heart className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="box-border h-auto max-h-[92svh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-lg bg-white p-0 sm:max-w-4xl"
          closeButtonClassName="[&_svg]:h-5 [&_svg]:w-5 [&_svg]:bg-transparent [&_svg]:text-slate-700"
        >
          <div className="grid min-w-0 overflow-x-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="min-w-0 bg-slate-950 p-6 text-white md:p-8">
              <DialogHeader>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary/20 text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <DialogTitle className="text-3xl font-semibold text-white">
                  Realizá tu donación
                </DialogTitle>
                <DialogDescription className="mt-3 text-base leading-7 text-white/75">
                  Las donaciones se realizan mediante transferencia bancaria.
                  Una vez realizada la transferencia, completá el formulario
                  para que podamos identificar tu aporte.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Datos bancarios</h3>
                </div>
                <div className="space-y-3">
                  <BankRow label="Banco" value={bankData.banco} />
                  <BankRow label="Alias" value={bankData.alias} />
                  <BankRow label="CBU" value={bankData.cbu} />
                  <BankRow
                    label="Cuenta Corriente en Pesos"
                    value={bankData.cuenta}
                  />
                  <BankRow label="Razon Social" value={bankData.razonSocial} />
                  <BankRow label="CUIT" value={bankData.cuit} />
                </div>
                <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-0 border-white/25 bg-white/10 text-white hover:bg-white hover:text-slate-950"
                    onClick={() => copyToClipboard("Alias", bankData.alias)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Alias
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-0 border-white/25 bg-white/10 text-white hover:bg-white hover:text-slate-950"
                    onClick={() => copyToClipboard("CBU", bankData.cbu)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar CBU
                  </Button>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmitDonation}
              className="flex min-w-0 flex-col gap-5 overflow-x-hidden p-6 md:p-8"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Informar transferencia
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                  Envia tu comprobante
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Esta primera version solo valida los campos en pantalla. No
                  guarda datos ni archivos.
                </p>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <DonationField label="Nombre" htmlFor="donation-name">
                  <Input
                    id="donation-name"
                    name="name"
                    required
                    placeholder="Tu nombre"
                    className="h-11 min-w-0 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                  />
                </DonationField>
                <DonationField label="Apellido" htmlFor="donation-lastname">
                  <Input
                    id="donation-lastname"
                    name="lastname"
                    required
                    placeholder="Tu apellido"
                    className="h-11 min-w-0 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                  />
                </DonationField>
              </div>

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
                <label
                  htmlFor="donation-receipt"
                  className="box-border flex min-h-28 min-w-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-primary/60 hover:bg-primary/5"
                >
                  <Clipboard className="mb-3 h-7 w-7 text-primary" />
                  <span className="text-sm font-semibold text-slate-950">
                    Seleccionar comprobante
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    PDF o imagen
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
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(event) =>
                    setSelectedFileName(event.target.files?.[0]?.name || "")
                  }
                />
              </DonationField>

              <Button
                type="submit"
                className="mt-2 h-12 bg-primary text-white hover:bg-primary/90"
              >
                Enviar comprobante <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </main>
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
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) => (
  <div className="grid min-w-0 gap-2">
    <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
      {label}
      <span className="ml-1 text-primary">*</span>
    </Label>
    {children}
  </div>
);

const TransparencyItem = ({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) => (
  <div className="flex gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-sm font-semibold leading-6 text-slate-800">{text}</p>
  </div>
);
