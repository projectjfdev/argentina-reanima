"use client";

import BannerHero from "@/components/BannerHero/BannerHero";
import { Titleh1 } from "@/components/Texts/Titleh1";
import React from "react";

import dynamic from "next/dynamic";
import { useMobile } from "@/hooks/useMedia";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Cuento from "@/components/RedesSociales/Cuento";

const FilialesMap = dynamic(
  () => import("@/components/FilialesMap/FilialesMap"),
  {
    ssr: false,
  },
);

const VideoPlayer = dynamic(() => import("@/components/Video/video-player"), {
  ssr: false,
});

const FilialesPage = () => {
  return (
    <div className="flex flex-col gap-7 md:gap-16">
      <BannerHero
        src="/images/banner-filiales.jpg"
        srcMobile="/images/banner-filiales.jpg"
        // src="https://res.cloudinary.com/dtbryiptz/image/upload/v1748046785/banner-filiales_ppg1af.png"
        // srcMobile="https://res.cloudinary.com/dtbryiptz/image/upload/v1748046785/banner-filiales_ppg1af.png"
        title="Filiales y convenios"
        imgClassname="object-cover"
        description="Somos 7 filiales en el país, con equipo de instructores y recursos propios, para continuar multiplicando manos que salvan vidas"
      />

      <div className="px-4 md:px-0 container mx-auto flex flex-col gap-7 md:gap-16 pb-7 md:pb-16">
        <div>
          <Titleh1
            title="Expandiendo Nuestra Misión: 7 Filiales en Todo el País"
            className="mx-auto mb-4 text-pretty text-3xl font-semibold md:text-4xl"
          />
          <div className="w-full space-y-1">
            <p>
              Queremos contarte que continuamos creciendo gracias a todos los
              que confían en Argentina Reanima. Somos 7 filiales en el país, con
              equipo de instructores y recursos propios, para continuar
              multiplicando manos que salvan vidas.
            </p>
            <p>
              Ushuaia, Rio Grande, Mar del Plata, Puerto Iguazú, Río Tercero,
              Lobería y La Plata. Seguinos atentos en nuestras redes, para
              enterarte de las próximas actividades que realizaremos en los
              diferentes lugares.
            </p>
            <p>Solo bajamos los brazos para hacer RCP</p>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <FilialesMap />
        </div>

        <section className="rounded-3xl bg-white px-5 py-8 shadow-sm ring-1 ring-slate-200 md:px-10 md:py-12">
          <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl space-y-3">
                <span className="inline-flex w-fit rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-sky-100">
                  Convenio institucional
                </span>

                <Titleh1 title="Facultad de Psicología — Universidad Nacional de Mar del Plata" />

                <p className="text-base leading-7 text-slate-600 md:text-lg">
                  Desde el año{" "}
                  <strong className="font-semibold text-slate-900">2023</strong>{" "}
                  acompañamos el proyecto{" "}
                  <em className="font-medium text-slate-800">
                    Nacer entre Palabras
                  </em>
                  , dirigido por la{" "}
                  <strong className="font-semibold text-slate-900">
                    Dra. Sandra Marañon
                  </strong>
                  .
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full shrink-0 md:w-auto">
                    Conocé más sobre la alianza
                  </Button>
                </DialogTrigger>

                <DialogContent className="z-9999 w-[95vw] max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      Convenio con la Facultad de Psicología
                    </DialogTitle>
                  </DialogHeader>

                  <VideoPlayer src="https://www.youtube.com/live/32x3rVsXgkI" />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-8 border-t border-slate-200 pt-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                  Nuestro compromiso
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Trabajamos para acercar conocimientos de RCP, DEA y prevención
                  de muerte súbita a la comunidad.
                </p>
              </div>

              <ol className="space-y-4">
                {[
                  "Promover acciones orientadas a la prevención de la muerte súbita.",
                  "Difundir técnicas de Reanimación Cardio Pulmonar (RCP) y uso del Desfibrilador Externo Automático (DEA).",
                  "Capacitar sobre el contenido y cumplimiento de la Ley 27159.",
                  "Mejorar la accesibilidad a la capacitación comunitaria en RCP, DEA y leyes de aplicación.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-4">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                      {index + 1}
                    </span>
                    <p className="text-base leading-7 text-slate-700 md:text-lg">
                      {item}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 md:p-6">
              <p className="text-base leading-7 text-slate-700 md:text-lg">
                Nuestra filial{" "}
                <strong className="font-semibold text-slate-900">
                  Mar del Plata
                </strong>
                , liderada por el instructor{" "}
                <strong className="font-semibold text-slate-900">
                  Santiago González Goller
                </strong>
                , proporciona los medios físicos, teóricos y prácticos para las
                capacitaciones. Las actividades se realizan en la Facultad y
                abordan RCP en{" "}
                <em className="font-medium text-slate-800">
                  adultos, niños y lactantes
                </em>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
      <Cuento />
    </div>
  );
};

export default FilialesPage;
