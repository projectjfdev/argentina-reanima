"use client";

import {
  features,
  FeatureSteps,
} from "@/components/FeatureComponent/FeatureComponent";

import { Titleh1 } from "@/components/Texts/Titleh1";
import { LogoSlider } from "@/components/LogoSlider/LogoSlider";
import { TextImage } from "@/components/TextImage/TextImage";
import { BoxTresHome } from "@/components/Box3Home/BoxTresHome";
import BannerHero from "@/components/BannerHero/BannerHero";
import { useEffect, useState } from "react";
import { AnimatedLogos } from "@/components/AnimatedCarousel/AnimatedLogos";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AutoOpenModal from "@/components/Modal/AutoOpenModal";
import { DicedHeroSection } from "@/components/TextImage/TextImage4";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // puedes ajustar el breakpoint
    };

    handleResize(); // set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col gap-7 md:gap-16">
      <BannerHero
        src="/images/4.jpeg"
        srcMobile="/images/9.jpeg"
        imgClassname={
          isMobile ? "object-cover mt-10" : "scale-110 object-cover"
        }
      />
      <div className="px-4 md:px-0 container mx-auto">
        <Titleh1
          title={
            "Dedicamos nuestros esfuerzos en luchar contra la muerte súbita."
          }
          className="mb-4 text-black dark:text-white"
        />
        <p className="text-lg text-black dark:text-white">
          Capacitamos a personas en técnicas de reanimación cardiopulmonar
          (RCP), uso de desfibriladores externos automáticos (DEA) y Maniobra de
          Heimlich, promoviendo además el cumplimiento de la Ley 27.159.
        </p>

        <p className="text-lg  text-black dark:text-white">
          Fomentamos una comunidad comprometida, solidaria y preparada para
          actuar de manera rápida y eficaz ante situaciones críticas como la
          muerte súbita, fortaleciendo el rol de cada persona como primer
          respondiente en la cadena de respuesta
        </p>
      </div>

      <Separator className="bg-gray-300" />

      <div className="px-4 md:px-0 ">
        {/* <TextImage /> */}
        <DicedHeroSection
          mainText="Tu compromiso es necesario"
          subMainText="Aprendé los pasos clave para actuar ante una situación de muerte súbita. Con nuestras capacitaciones, dictadas por instructores certificados, podes estar preparado para intervenir de manera segura y eficaz cuando más se necesita; porque cada segundo cuenta."
          buttonText="Shop Now"
          slides={[
            {
              title: "Purple Cauliflower",
              image: "/images/1.jpeg",
            },
            {
              title: "Strawberry",
              image: "/images/10.jpg",
            },
            {
              title: "Feijoa",
              image: "/images/6.jpeg",
            },
            {
              title: "Fruits and Vegetables",
              image: "/images/3.jpeg",
            },
          ]}
          onMainButtonClick={() => console.log("Main button clicked for LTR")}
          onGridImageHover={(index) =>
            console.log(`Grid image ${index} hovered for LTR`)
          }
          onGridImageClick={(index) =>
            console.log(`Grid image ${index} clicked for the LTR`)
          }
          subMainTextStyle={{ color: "var(--diced-hero-section-sub-text)" }}
          separatorColor="var(--diced-hero-section-separator)"
          mobileBreakpoint={1000}
        />
      </div>

      <div className="bg-blue-100 py-5 md:py-10 px-4 md:px-0 my-20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center mb-6">
          <Titleh1 title="Últimas noticias" className="mb-6 text-gray-50" />
          <Button variant="outline">
            <a href="/noticias">Ver todas</a>
          </Button>
        </div>
        <BoxTresHome />
      </div>

      <div className="px-4 md:px-0">
        <FeatureSteps
          features={features}
          title="Capacitación en RCP, estés donde estés"
          autoPlayInterval={4000}
          imageHeight="h-[500px]"
        />
      </div>
      <Separator className="bg-gray-300 mt-20" />

      <AnimatedLogos />

      <div className="pb-7 md:pb-10 px-4 md:px-0">
        <LogoSlider />
      </div>
      <AutoOpenModal />
    </div>
  );
}
