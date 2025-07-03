"use client";

import React from "react";
import { motion } from "framer-motion";
import BannerHero from "@/components/BannerHero/BannerHero";
import { Titleh1 } from "@/components/Texts/Titleh1";
import { Separator } from "@/components/ui/separator";
import { AnimatedQuienesSomos } from "@/components/AnimatedCarousel/AnimatedQuienesSomos";
import { useMobile } from "@/hooks/useMedia";
import InteractiveSelector from "@/components/AnimatedCarousel/CarouselImgs";

// Animación reusable
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const QuienesSomosPage = () => {
  const isMobile = useMobile();
  return (
    <div className="flex flex-col gap-7 md:gap-16">
      <BannerHero
        src="https://res.cloudinary.com/dtbryiptz/image/upload/v1748923214/IMG_8319_a7pfch.jpg"
        srcMobile="https://res.cloudinary.com/dtbryiptz/image/upload/v1748923214/IMG_8319_a7pfch.jpg"
        title="¿Quiénes somos?"
        description="Somos una Asociación Civil que lucha contra la muerte súbita. Conoce más sobre nuestra misión y visión."
        imgClassname={
          isMobile ? "object-cover object-[right_30%] " : "object-cover"
        }
      />

      <div className="px-4 container mx-auto flex flex-col gap-7 md:gap-16">
        <motion.div {...fadeIn(0.1)}>
          <Titleh1 title="En Argentina Reanima, creemos que cada vida cuenta y que cada segundo puede marcar la diferencia" />
        </motion.div>

        <motion.div
          className="space-y-5 mx-auto text-base md:text-lg text-muted-foreground leading-relaxed"
          {...fadeIn(0.2)}
        >
          <p>
            Somos una organización argentina dedicada a la formación en
            Reanimación Cardiopulmonar (RCP) y uso del Desfibrilador Externo
            Automático (DEA), con un propósito claro y urgente: luchar contra la
            muerte súbita y contribuir a una sociedad más comprometida con el
            cuidado de la vida.
          </p>
          <p>
            Trabajamos para que la Ley Nacional 27.259, reglamentada en 2022, se
            cumpla en todos los espacios públicos y privados. Promovemos la
            instalación de desfibriladores y la capacitación del personal como
            parte de una cultura de prevención activa.
          </p>
          <p>
            Nuestro equipo está conformado por profesionales, instructores y
            colaboradores apasionados, con formación y experiencia, unidos por
            una misma convicción: la capacitación salva vidas. Enseñamos
            técnicas efectivas y actualizadas, basadas en estándares
            internacionales, para que cada persona sepa cómo actuar cuando más
            importa.
          </p>
          <p>
            Porque salvar vidas es posible. Y comienza por saber cómo hacerlo.
            Nosotros estamos convencidos de ello. Y somos quienes podemos
            enseñarte.
          </p>
          <p>
            Soñamos con una Argentina más preparada, más consciente y más
            humana. Y trabajamos cada día para hacerlo realidad.
          </p>
        </motion.div>

        {/* NUEVA SECCIÓN: Origen y Compromiso */}
        <motion.section
          className="relative bg-muted/30 md:p-6 rounded-2xl  overflow-hidden"
          {...fadeIn(0.3)}
        >
          <div className="relative z-10 space-y-6 mx-auto text-base md:text-lg leading-relaxed text-muted-foreground">
            <Titleh1 title="Nuestro origen y compromiso continuo" />
            <p>
              Argentina Reanima nació en enero de 2021 con un propósito urgente:
              impulsar la reglamentación de la Ley Nacional 27.159, sancionada
              en 2015 pero aún sin aplicación concreta en todo el país.
            </p>
            <p>
              Gracias al trabajo constante de difusión, incidencia y
              articulación con actores sociales y políticos, ese primer objetivo
              se cumplió en julio de 2022, cuando finalmente se publicó su
              reglamentación. Todo ello fue posible gracias a una enorme
              cantidad de voluntades, que se unieron para lograrlo. Nosotros,
              con mucha humildad y pasión por lo que hacemos, aportamos nuestro
              granito de arena a que esto sea posible.
            </p>
            <p>
              Desde entonces, nuestra misión se transformó pero no perdió
              fuerza: trabajamos para lograr su plena implementación, porque
              observamos —y sentimos— que la ley aún no se cumple de manera
              efectiva en la Argentina.
            </p>
            <p>
              Hoy seguimos generando conciencia, promoviendo el cumplimiento de
              la normativa en escuelas, gimnasios, natatorios, clubes, empresas,
              espacios públicos y privados, convencidos de que su aplicación
              puede reducir significativamente las más de 40.000 muertes súbitas
              que ocurren cada año en nuestro país.
            </p>
          </div>
        </motion.section>

        {/* LEY */}
        <motion.div className="md:text-center space-y-10" {...fadeIn(0.4)}>
          <Titleh1 title="Ley 27.159: Nuestro Origen, Nuestra Misión" />
          <p>
            Objetivo Cumplido: Reglamentación de la Ley 27159 de Muerte Súbita y
            Sistema Integral de Prevención
          </p>

          <audio controls className="md:mx-auto md:w-1/3">
            <source src="/audio/audioMuerteSubita.mp3" type="audio/mpeg" />
            Tu navegador no soporta audio HTML5.
          </audio>
        </motion.div>

        <Separator />
      </div>
      {!isMobile && <InteractiveSelector />}
      <AnimatedQuienesSomos />
    </div>
  );
};

export default QuienesSomosPage;
