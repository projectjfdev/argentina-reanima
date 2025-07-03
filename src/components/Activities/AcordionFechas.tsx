"use client";

import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import {
  Users,
  HeartPulse,
  Gavel,
  CalendarRange,
  Heart,
  Globe,
  Medal,
} from "lucide-react";

const fechas = [
  {
    id: 1,
    title: "14 de enero – Fundación de Argentina Reanima (2021)",
    category: "Aniversario",
    content:
      "Ese día nació nuestra querida Asociación, para unirnos y luchar contra la muerte súbita. Cada año renovamos la misión de educar, prevenir, concientizar. También recordamos a todos los que desde el inicio, fueron parte de este equipo en diferentes ciudades de nuestro país. Solo bajamos los brazos para hacer y enseñar RCP.",
    icon: <Users className="hidden md:block w-5 h-5 text-secondary" />,
  },
  {
    id: 2,
    title: "12 de julio – Día Provincial de la Reanimación Cardiopulmonar",
    category: "RCP",
    content:
      "Natalicio del Dr. René G. Favaloro. Fecha propuesta para promover la enseñanza de RCP en honor al legado del Dr. Favaloro. Una oportunidad para multiplicar conciencia, formación, agradecer y homenajear a un profesional íntegro.",
    icon: <HeartPulse className="hidden md:block w-5 h-5 text-secondary" />,
  },
  {
    id: 3,
    title: "13 de julio de 2022 – Reglamentación de la Ley 27.159",
    category: "Marco normativo",
    content:
      "Con el Decreto 402/2022 se reglamentó la Ley que obliga a instalar DEA y capacitar en RCP en espacios públicos. Desde entonces, el país cuenta con un marco legal activo para una sociedad cardio-protegida.",
    icon: <Gavel className="hidden md:block w-5 h-5 text-secondary" />,
  },
  {
    id: 4,
    title:
      "21 al 27 de agosto – Semana Nacional de Concientización y Prevención de la Muerte Súbita",
    category: "Campaña nacional",
    content:
      "Establecida por la Ley Nacional 27.159, esta semana busca garantizar el acceso a espacios cardio asistidos y entrenar a la población. Durante estos días se intensifican las acciones de capacitación, control y difusión a nivel nacional.",
    icon: <CalendarRange className="hidden md:block w-5 h-5 text-secondary" />,
  },
  {
    id: 5,
    title: "29 de septiembre – Día Mundial del Corazón",
    category: "Salud cardiovascular",
    content:
      "Promovido por la Federación Mundial del Corazón, este día busca concientizar sobre enfermedades cardiovasculares y fomentar hábitos saludables. La RCP también es prevención.",
    icon: <Heart className="hidden md:block w-5 h-5 text-secondary" />,
  },
  {
    id: 6,
    title: "16 de octubre – Día Mundial de la RCP (World Restart a Heart Day)",
    category: "Conciencia global",
    content:
      "Organizado por entidades internacionales, este día busca que más personas aprendan a actuar ante una emergencia cardíaca.",
    icon: <Globe className="hidden md:block w-5 h-5 text-secondary" />,
  },
  {
    id: 7,
    title: "29 de noviembre – Día del Instructor de RCP (Argentina)",
    category: "Reconocimiento",
    content:
      "Celebramos el rol de quienes forman personas que intentarán dar probabilidad de sobrevida en eventos de muerte súbita.",
    icon: <Medal className="hidden md:block w-5 h-5 text-secondary" />,
  },
];

const AcordionFechas = () => {
  return (
    <div className="md:px-0 container mx-auto flex flex-col gap-7 md:gap-16">
      <Accordion type="single" collapsible>
        {fechas.map((n) => (
          <AccordionItem value={n.id.toString()} key={n.id} className="py-2">
            <AccordionTrigger className="flex flex-1 items-center justify-between py-2 text-left">
              <div className="flex items-center gap-3">
                {n.icon}
                {n.title}
                <Badge
                  variant="outline"
                  className="ml-2 whitespace-nowrap border border-slate-300"
                >
                  {n.category}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2 text-gray-800">
              {n.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default AcordionFechas;
