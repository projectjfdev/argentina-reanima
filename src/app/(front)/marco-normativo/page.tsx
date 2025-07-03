"use client";
import BannerHero from "@/components/BannerHero/BannerHero";
import { Faq } from "@/components/Faqs/Faqs";
import { Titleh1 } from "@/components/Texts/Titleh1";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarCheck2, Flag, MapPin, Scale } from "lucide-react";
import React from "react";

const MarcoNormativoPage = () => {
  return (
    <div className="flex flex-col gap-7 md:gap-16">
      <BannerHero
        src="https://res.cloudinary.com/dtbryiptz/image/upload/v1748918703/ley27159_gmfwyq.jpg"
        srcMobile="https://res.cloudinary.com/dtbryiptz/image/upload/v1748918703/ley27159_gmfwyq.jpg"
        imgClassname="md:scale-y-[1.4]"
      />

      <div className="px-4 md:px-0 container mx-auto flex flex-col gap-7 md:gap-16 md:pb-16">
        <div className="space-y-3">
          <Titleh1
            className="md:text-start pb-3"
            title="Marco legal sobre RCP y maniobra de Heimlich en Argentina"
          />
          <p>
            En Argentina Reanima creemos que el conocimiento contribuye a salvar
            vidas. Por eso, promovemos la enseñanza de Reanimación
            Cardiopulmonar (RCP) y Maniobras de desobstrucción como la Maniobra
            de Heimlich, alineados con el marco legal vigente a nivel nacional,
            provincial y municipal.
          </p>
          <p>
            A continuación, compartimos las principales leyes y ordenanzas en
            todo el país:
          </p>
          <div className="py-3">
            <Separator className="h-1 " />
          </div>
          <h2 className="pb-3 text-2xl md:text-3xl font-semibold md:text-start text-gray-800  lg:text-4xl dark:text-white flex gap-4 items-center">
            <Scale className="text-primary" /> Legislación Nacional
          </h2>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
              Ley 27.159 (2015)
            </h3>
            <Button
              onClick={() =>
                window.open(
                  "https://www.argentina.gob.ar/normativa/nacional/ley-27159-249563/texto",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Sistema de prevención integral de muerte súbita
          </h3>

          <li>
            Obliga a instalar desfibriladores externos automáticos (DEA) en
            espacios con gran concurrencia.
          </li>
          <li>Establece capacitación en RCP y uso de DEA</li>
          <li>
            Fue reglamentada por el Decreto 402/2022, que define los espacios
            cardioprotegidos y crea un registro nacional de DEA.
          </li>
          <div className="py-3">
            <Separator className="h-1 " />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <h2 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
              Ley 26.835 (2012)
            </h2>
            <Button
              onClick={() =>
                window.open(
                  "https://www.argentina.gob.ar/normativa/nacional/ley-26835-207654",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>

          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Promoción y enseñanza de RCP básica en escuelas
          </h3>

          <li>
            Establece la enseñanza obligatoria de maniobras básicas de RCP en
            escuelas de nivel medio y superior.
          </li>
          <li>
            Capacita a docentes y estudiantes para actuar ante un paro
            cardiorrespiratorio.
          </li>

          <div className="py-3">
            <Separator className="h-1 " />
          </div>

          <h4 className="pb-3 text-2xl md:text-3xl font-semibold md:text-start text-gray-800  lg:text-4xl dark:text-white flex gap-4 items-center">
            <Flag className="text-primary" /> Legislación provincial y municipal
          </h4>
          <h4 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Buenos Aires
          </h4>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ley 15.051</b>: Exige carteles con instrucciones de la Maniobra
              de Heimlich en lugares públicos, gastronómicos y educativos.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://normas.gba.gob.ar/documentos/0PzgkUAB.html",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ley 15.180</b>: Declara el 12 de julio como el Día Provincial
              de la RCP en homenaje al Dr. Favaloro.
            </li>

            <Button
              onClick={() =>
                window.open(
                  "https://normas.gba.gob.ar/documentos/087o61s5.html",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>

          <div className="py-3">
            <Separator className="h-1 " />
          </div>

          <h4 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            La Plata
          </h4>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ordenanza 12.348</b>: Adhiere a la Ley provincial de espacios
              cardioprotegidos.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://sibom.slyt.gba.gob.ar/bulletins/7658/contents/1791658",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <li>Capacita a empleados municipales en RCP.</li>

          <h4 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Mar Del Plata (General Pueyrredon)
          </h4>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ordenanza 22.562</b>: Exige DEA y personal capacitado en
              lugares con alta concurrencia.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://basenormas.concejomdp.gov.ar/normas/show/normas/22687",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <li>
            Programa municipal <span>"Reanimemos"</span> para capacitaciones
            comunitarias.
          </li>

          <h4 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Lobería
          </h4>

          <li>(Sin ordenanza vigente encontrada hasta la fecha)</li>

          <h4 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Río Tercero (Córdoba)
          </h4>

          <li>
            Ordenanza crea programa obligatorio de capacitación en RCP y uso de
            DEA para personal municipal.
          </li>

          <h4 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Río Grande (Tierra del Fuego)
          </h4>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ordenanza 3902/18</b>: Exige carteles explicativos sobre la
              maniobra de Heimlich.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://www.riogrande.gob.ar/wp-content/uploads/subidas/transparencia/digesto/ord%203902.pdf",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ordenanza 4324/2021</b>: Establece capacitaciones y campañas de
              difusión de RCP.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://www.riogrande.gob.ar/wp-content/uploads/subidas/transparencia/digesto/ord%204324.pdf",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>

          <h4 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Ushuaia
          </h4>

          <li>(Sin ordenanza específica registrada hasta la fecha)</li>

          <div className="py-3">
            <Separator className="h-1 " />
          </div>

          <h3 className="pb-3 text-2xl md:text-3xl font-semibold md:text-start text-gray-800  lg:text-4xl dark:text-white flex gap-4 items-center">
            <MapPin className="text-primary" /> Otras Provincias
          </h3>
          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            La Rioja
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ley 10.389</b>: Carteles obligatorios sobre Heimlich en
              instituciones públicas.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://www.boletinoflarioja.com.ar/pdf/2021//2021-06-15.pdf",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Tucumán
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ley 9.792</b>: Establece cartelera y capacitación sobre
              Maniobra de Heimlich en espacios de atención al público.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://www.eleg.app/articulo/tucuman-ley-9792",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Chaco
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ley 3.855-E</b>: Capacita en RCP, Heimlich y primeros auxilios
              a docentes y estudiantes.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://www.saij.gob.ar/3855-local-chaco-capacitacion-para-personal-docente-alumnos-sobre-tecnicas-primeros-auxilios-reanimacion-cardiopulmonar-desobstruccion-vias-aereas-lph0503855-2023-07-05/123456789-0abc-defg-558-3050hvorpyel?&o=88&f=Total%7CTipo%20de%20Documento/Legislaci%F3n/Ley/Ley%7CFecha%5B50%2C1%5D%7COrganismo%7CPublicaci%F3n%7CTema/Salud%20p%FAblica%7CEstado%20de%20Vigencia%7CAutor%5B50%2C1%5D%7CJurisdicci%F3n/Local/Chaco&t=358",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Río Negro
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ley 5.531</b>: Carteles y difusión de maniobra de Heimlich;
              formación docente obligatoria.
            </li>
            <Button
              onClick={() =>
                window.open(
                  "https://www.ecofield.net/Legales/RioNegro/ley5531_RN.htm",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>

          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Catamarca
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-5">
            <li>
              <b>Ley 5.623</b>: Capacita en RCP en niveles secundarios,
              terciarios y administración pública.
            </li>

            <Button
              onClick={() =>
                window.open(
                  "https://digesto.catamarca.gob.ar/ley/ley_detail/748",
                  "_blank"
                )
              }
              className="text-xs h-7"
            >
              Ver más
            </Button>
          </div>
          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Córdoba
          </h3>

          <li>
            Municipios como Mendiolaza, Jesús María y Colonia Caroya tienen
            ordenanzas que obligan a la capacitación en RCP y Heimlich para
            personal municipal, gastronómico y solicitantes de licencias de
            conducir.
          </li>

          <h3 className="text-2xl font-semibold md:text-start text-gray-800   dark:text-white">
            Misiones
          </h3>

          <li>
            En <b>Puerto Iguazú</b> y <b>Oberá</b>, existen ordenanzas
            municipales que exigen carteles y capacitación obligatoria para el
            personal en contacto con público.
          </li>

          <div className="py-3">
            <Separator className="h-1 " />
          </div>

          <h3 className="pb-3 text-3xl font-semibold md:text-start text-gray-800  flex items-center gap-4 dark:text-white">
            <CalendarCheck2 className="text-primary" /> Actualización Permanente
          </h3>

          <p>
            En Argentina Reanima trabajamos para mantener esta información
            actualizada. Si conoces una norma que no figura aquí, escribimos a{" "}
            <a
              href="mailto:argentinareanima.ac@gmail.com"
              className="hover:text-gray-400"
            >
              argentinareanima.ac@gmail.com
            </a>
          </p>
        </div>

        {/* LEY */}

        <div className="py-3">
          <Separator className="h-1 " />
        </div>

        <Faq />
      </div>
    </div>
  );
};

export default MarcoNormativoPage;
