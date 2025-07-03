"use client";
import BannerHero from "@/components/BannerHero/BannerHero";
import { Titleh1 } from "@/components/Texts/Titleh1";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Instagram } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import React, { Suspense } from "react";
// En esta LP sumar este contenido https://drive.google.com/drive/u/4/folders/1zfLpbMTadsQbO0fukvItE3evFWxP4phu https://res.cloudinary.com/dtbryiptz/image/upload/v1748912110/banner-principal-Picsart-AiImageEnhancer_py0oum.jpg

const VideoPlayer = dynamic(() => import("@/components/Video/video-player"), {
  ssr: false,
});

const RcpYCuidadoEmocionalPage = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-7 md:gap-16">
      <BannerHero
        src="https://res.cloudinary.com/dtbryiptz/image/upload/v1748912110/banner-principal-Picsart-AiImageEnhancer_py0oum.jpg"
        srcMobile="https://res.cloudinary.com/dtbryiptz/image/upload/v1748912110/banner-principal-Picsart-AiImageEnhancer_py0oum.jpg"
        title={"Somos Seres"}
        secondTitle="Biopsicosociales"
        imgClassname={"object-cover"}
      />

      <div className="px-4 md:px-0 container mx-auto flex flex-col gap-7 md:gap-16 md:pb-16">
        <Titleh1 title="Somos Seres Biopsicosociales" />

        <div className="space-y-3">
          <p>
            El protocolo de intervenciones en RCP debe involucrar el aspecto
            Emocional de las personas, tanto en la primera intervención, en el
            durante y en el después de la misma, independientemente del
            resultado obtenido; y así lo impulsamos desde nuestra Organización
            con el asesoramiento de esta destacadísima y reconocida profesional.
          </p>
          <p>
            Desde nuestra Asociación y con el acompañamiento de la Lic. Alicia
            Galfasó, seguimos luchando contra la muerte súbita e iniciamos el
            camino para incluir el Cuidado y Autocuidado Emocional en la
            práctica de RCP, y tenemos el orgullo de haber sido los precursores
            de lo anterior.
          </p>
          <p>
            Nuestras actividades de formación incluyen, desde una visión
            integral, todos los aspectos descriptos y seguiremos multiplicando
            los mismos, convencidos de su importancia.
          </p>
          <p>
            Porque tal lo expresa la Licenciada en sus riquísimos talleres:{" "}
            <b>QUE LO QUE NOS APASIONA, NO NOS ENFERME</b>
          </p>
          <a
            href="https://www.instagram.com/aliciagalfaso/#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>
              <Instagram className="mr-2" /> @aliciagalfaso
            </Button>
          </a>
        </div>

        {/* LEY */}

        <Separator />

        <Card className="max-w-7xl flex text-start md:w-1/4  md:mx-auto ">
          <div className="h-full w-full transition-opacity duration-200 fade-in hover:opacity-70">
            <Suspense fallback={<div>Cargando video...</div>}>
              <VideoPlayer
                src={
                  "https://res.cloudinary.com/dtbryiptz/video/upload/v1748913167/Alicia_aephdb.mp4"
                }
              />
            </Suspense>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RcpYCuidadoEmocionalPage;
