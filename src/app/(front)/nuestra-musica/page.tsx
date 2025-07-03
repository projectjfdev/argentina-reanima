"use client";

import BannerHero from "@/components/BannerHero/BannerHero";
import { Titleh1 } from "@/components/Texts/Titleh1";
import React from "react";
import { TextVideoBeeGees } from "@/components/TextImage/TextVideoBeeGees";
import { Separator } from "@/components/ui/separator";
import { TextVideoPalmeras } from "@/components/TextImage/TextVideoPalmeras";
import { Stats } from "@/components/Stats/Stats";
import { FireExtinguisher, HeartPulse, Smartphone } from "lucide-react";

const stats = [
  {
    icon: FireExtinguisher,
    label: "Es en incendio",
    value: "1 muerte cada 333",
  },
  {
    icon: HeartPulse,
    label: "Es por enfermedad cardiovascular",
    value: "1 muerte cada 3",
  },
  {
    icon: Smartphone,
    label:
      "Puede costar más que un desfibrilador. Uno entretiene. El otro salva vidas.",
    value: "Un celular",
  },
];

const NuestraMusicaPage = () => {
  return (
    <div className="flex flex-col">
      <BannerHero
        src={"/images/Banner-nuestra-musica.jpg"}
        srcMobile={"/images/Banner-nuestra-musica.jpg"}
        title="Nuestra música"
        description="Las canciones que nos ayudan a reflexionar y mantener el ritmo correcto para hacer RCP"
        imgClassname={"object-cover"}
      />
      <Stats stats={stats} />

      <div className="px-4 md:px-0 container mx-auto flex flex-col gap-7 md:gap-16 pb-7 md:pb-16 mt-20">
        <Titleh1 title="Marcando el ritmo" />
        <TextVideoPalmeras />
        <Separator className="bg-gray-300" />
        <TextVideoBeeGees />
      </div>

      <div className="px-4 md:px-0 container mx-auto flex flex-col gap-7 md:gap-16 pb-7 md:pb-16">
        <Separator className="bg-gray-300" />
        <Titleh1 title="Pregunta por la Vida: La Voz de RCP en Spotify" />

        <iframe
          style={{ borderRadius: "12px" }}
          src="https://open.spotify.com/embed/track/62bECNwYQFBbmmjxnlPTYk?utm_source=generator"
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default NuestraMusicaPage;
