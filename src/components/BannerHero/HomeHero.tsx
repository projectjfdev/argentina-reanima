import { Button } from "@/components/ui/button";
import { ArrowRight, HeartPulse, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-white px-4 pb-24 pt-24 md:pb-28 md:pt-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[linear-gradient(180deg,rgba(44,156,193,0.12),rgba(255,255,255,0)_72%)]" />
      <div className="absolute left-1/2 top-28 -z-10 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

      <div className="container mx-auto">
        <div className="grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center lg:gap-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <HeartPulse className="h-4 w-4" />
              Asociacion Civil Argentina Reanima
            </div>

            <div className="mt-8 space-y-5">
              <h1 className="text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                Solo bajamos los brazos para hacer RCP.
              </h1>
              <p className="max-w-xl text-xl font-medium leading-8 text-slate-800 md:text-2xl md:leading-9">
                Tus manos pueden salvar vidas.
              </p>
              <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Capacitamos a personas en tecnicas de reanimacion cardiopulmonar
                (RCP), uso de desfibriladores externos automaticos (DEA) y
                Maniobra de Heimlich para fortalecer comunidades preparadas ante
                situaciones criticas.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/capacitaciones">
                  Ver capacitaciones <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/quienes-somos">Conocer la historia</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] md:max-w-none md:translate-x-2 lg:translate-x-6">
            <div className="absolute -inset-4 rounded-[2rem] border border-primary/10 bg-white/60 shadow-2xl shadow-slate-900/8" />
            <div className="relative overflow-hidden rounded-[1.6rem] bg-slate-100 shadow-2xl shadow-slate-900/16 ring-1 ring-slate-900/8">
              <Image
                src="/images/4.jpeg"
                alt="Argentina Reanima. Solo bajamos los brazos para hacer RCP."
                width={1920}
                height={1344}
                priority
                className="aspect-[1.35] h-auto w-full object-cover md:block"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_55%,rgba(255,255,255,0.16))]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
