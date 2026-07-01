"use client";

import { AnimatedLogos } from "@/components/AnimatedCarousel/AnimatedLogos";
import BannerHero from "@/components/BannerHero/BannerHero";
import { AnimatedFeatureSpotlight } from "@/components/BannerHero/BannerHomenaje";
import { BoxTresHome } from "@/components/Box3Home/BoxTresHome";
import {
  features,
  FeatureSteps,
} from "@/components/FeatureComponent/FeatureComponent";
import { LogoSlider } from "@/components/LogoSlider/LogoSlider";
import { DicedHeroSection } from "@/components/TextImage/TextImage4";
import { Titleh1 } from "@/components/Texts/Titleh1";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, HeartPulse, MapPinned, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const pillars = [
  {
    icon: HeartPulse,
    title: "Respuesta ante emergencias",
    text: "Formacion practica para actuar con criterio y rapidez.",
  },
  {
    icon: ShieldCheck,
    title: "RCP, DEA y Heimlich",
    text: "Contenidos enfocados en habilidades concretas y aplicables.",
  },
  {
    icon: MapPinned,
    title: "Alcance comunitario",
    text: "Capacitaciones para fortalecer primeros respondientes.",
  },
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="flex flex-col bg-white text-slate-950">
      <BannerHero
        src="/images/4.jpeg"
        srcMobile="/images/9.jpeg"
        imgClassname={
          isMobile ? "object-cover object-center" : "scale-105 object-cover"
        }
      />

      <section className="container mx-auto -mt-12 px-4 pb-14 md:pb-20">
        <div className="relative grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/8 md:grid-cols-3 md:p-7">
          {pillars.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-md p-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 pb-16 md:grid-cols-[0.9fr_1.1fr] md:items-start md:pb-24">
        <div className="md:sticky md:top-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Nuestra mision
          </p>
          <Titleh1
            title="Dedicamos nuestros esfuerzos en luchar contra la muerte subita."
            className="items-start [&>h1]:text-left"
          />
        </div>
        <div className="space-y-5 text-base leading-8 text-slate-700 md:text-lg">
          <p>
            Capacitamos a personas en tecnicas de reanimacion cardiopulmonar
            (RCP), uso de desfibriladores externos automaticos (DEA) y Maniobra
            de Heimlich, promoviendo ademas el cumplimiento de la Ley 27.159.
          </p>
          <p>
            Fomentamos una comunidad comprometida, solidaria y preparada para
            actuar de manera rapida y eficaz ante situaciones criticas como la
            muerte subita, fortaleciendo el rol de cada persona como primer
            respondiente en la cadena de respuesta.
          </p>
        </div>
      </section>

      <Separator className="bg-slate-200" />

      <section className="bg-slate-50 px-4 py-16 md:py-24">
        <AnimatedFeatureSpotlight
          heading="En memoria de Sergio Marcos"
          description="Enorme persona, ser humano increible e instructor apasionado; enseno hasta el ultimo momento, incluso mientras daba una batalla larga y digna contra la enfermedad. Nunca perdio las ganas de compartir, de ensenar, de mostrar lo bueno de la vida y de seguir sembrando conciencia para salvar vidas."
          buttonText="Ver homenaje"
          buttonProps={{
            onClick: () => window.open("/homenaje-sergio-marcos"),
          }}
          imageUrl="/images/sergio/sergio-main.jpeg"
          imageAlt="Sergio, instructor de RCP con pechera blanca de Argentina Reanima, demostrando maniobra de desobstruccion de vias aereas en un muneco de bebe durante un curso de primeros auxilios."
        />
      </section>

      <section className="px-4 md:px-0">
        <DicedHeroSection
          mainText="Tu compromiso es necesario"
          subMainText="Aprendé los pasos clave para actuar ante una situación de muerte
                súbita. Con nuestras capacitaciones, dictadas por instructores
                certificados, podes estar preparado para intervenir de manera
                segura y eficaz cuando más se necesita; porque cada segundo
                cuenta."
          buttonText="Nuestra historia"
          slides={[
            { title: "Capacitacion de RCP", image: "/images/1.jpeg" },
            { title: "Practica con instructores", image: "/images/10.jpg" },
            { title: "Formacion comunitaria", image: "/images/6.jpeg" },
            { title: "Primeros auxilios", image: "/images/3.jpeg" },
          ]}
          mobileBreakpoint={1000}
        />
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white md:py-24">
        <div className="container mx-auto mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Actualidad
            </p>
            <Titleh1
              title="Ultimas noticias"
              className="items-start [&>h1]:text-left [&>h1]:text-white"
            />
          </div>
          <Button
            asChild
            variant="outline"
            className="w-fit border-white/25 bg-white/5 text-white hover:bg-white hover:text-slate-950"
          >
            <Link href="/noticias">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <BoxTresHome />
      </section>

      <section className="px-4 py-16 md:py-24">
        <FeatureSteps
          features={features}
          title="Capacitacion en RCP, estes donde estes"
          autoPlayInterval={5000}
          imageHeight="h-[500px]"
        />
      </section>

      <Separator className="bg-slate-200" />

      <section className="py-12 md:py-16">
        <AnimatedLogos />
      </section>

      <section className="px-4 pb-10 md:pb-14">
        <LogoSlider />
      </section>
    </main>
  );
}
