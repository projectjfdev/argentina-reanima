"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Titleh1 } from "../Texts/Titleh1";

export const Timeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const handleNavigate = () => {
    window.open(
      "https://www.camuzzigas.com/seguridad/monoxido-de-carbono/",
      "_blank"
    );
  };

  const data = [
    {
      title: "2025",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            El sábado 22 de marzo de 2025, en el marco de la responsabilidad que
            nos confió con orgullo la Federación Argentina de Cardiología
            (@fac_cardio), llevamos a cabo el examen práctico de cinco nuevos
            instructores de RCP y DEA. Junto al Dr. André Rossi
            (@andrericardorossi), a quien agradecemos por su hospitalidad y
            profesionalismo, logramos cumplir un nuevo desafío para nuestra
            Asociación. Esta instancia forma parte del convenio recientemente
            firmado en Mar del Plata con esta prestigiosa sociedad científica.
            Agradecemos a todos los asistentes que viajaron desde distintos
            puntos de Buenos Aires y CABA para completar su formación. Un
            reconocimiento especial a todo el equipo de Argentina Reanima, que
            trabaja incansablemente con pasión y compromiso, sin perder de vista
            nuestros valores y objetivos. Este esfuerzo constante nos impulsa a
            seguir creciendo y nos reafirma que estamos en el camino correcto.
            Seguimos profesionalizando la capacitación para luchar contra la
            muerte súbita. Solo bajamos los brazos para hacer RCP.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747670716/60E0B2_1_vxfjlk.jpg"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747670756/FB0EF5_1_qfatye.jpg"
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2025",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Compartimos con ustedes las emociones de un fin de semana intenso e
            importante para nuestra Asociación. El viernes 14 de marzo de 2025
            viajamos a Mar del Plata y, con gran orgullo, firmamos un convenio
            con la Federación Argentina de Cardiología (FAC). A través de esta
            alianza, seguiremos enseñando RCP a la comunidad, formando nuevos
            socorristas y trabajando de manera conjunta en diversas iniciativas
            y fechas clave, con el objetivo de sumar más manos que salven vidas
            y continuar difundiendo la Ley 27159 para garantizar su aplicación
            efectiva. Por la tarde, en nuestra labor como instructores de la
            FAC, tuvimos el honor de evaluar a nuevos instructores provenientes
            de distintas regiones del país, quienes rindieron su examen práctico
            final y ahora forman parte de una creciente red en toda Argentina.
            Cerramos este intenso recorrido el sábado por la mañana con una
            actividad de RCP abierta a la comunidad. No solo brindamos esta
            herramienta vital a los asistentes, sino que también recolectamos
            una significativa cantidad de ropa y alimentos para enviar a
            nuestros hermanos de Bahía. Esta acción solidaria fue posible
            gracias al trabajo conjunto con la @FAC y la @Fundación Desfibrilar.
            Nuestro crecimiento y avances en estos convenios son el reflejo de
            nuestra transparencia, humildad y firme compromiso en minimizar las
            40.000 muertes súbitas anuales que engrosan las estadísticas del
            país. Estamos convencidos de que este es el camino y seguiremos
            recorriéndolo con la misma dedicación. Gracias a la Federación
            Argentina de Cardiología por confiar en nosotros. Gracias a nuestros
            socios, instructores y socorristas de Argentina Reanima por su
            entrega inquebrantable. Gracias a quienes participan en cada
            capacitación, a las empresas que nos apoyan y a nuestras familias,
            que nos brindan su tiempo para que podamos seguir alimentando esta
            pasión. Somos la Asociación Civil Argentina Reanima y solo bajamos
            los brazos para hacer RCP.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747670354/9d760599-57a8-45f6-bb86-0ea80ff22b6a_dag7vp.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-top object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747670392/73f929d8-367b-4a93-b4a5-8676b644f9a3_tqftrg.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-bottom object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747670422/b7ddc999-cda8-47d9-bc1e-9e8077e8f73a_yyo3zq.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747670455/WHATSA_1_h7xeti.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-top object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },

    {
      title: "2024",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Asociación Civil Argentina Reanima filial Cba, Julio Godoy
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747675850/cordoba_u4ngce.png"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747675957/cordoba2_zyhnci.png"
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2023",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Con el aporte mensual de los socios y el dinero que nos ingreso por
            las actividades de capacitación que realizamos con la empresa
            <span
              onClick={handleNavigate}
              className="bg-gray-200 px-2 text-primary rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-200"
            >
              Camuzzi
            </span>
            , pudimos comprar 25 torsos para practicas de RCP. Elementos muy
            importantes para poder realizar nuestras actividades y enseñar a
            Salvar Vidas. Gracias a los que mes tras mes aportan su granito de
            arena abonando la cuota de socio. Gracias{" "}
            <span
              onClick={handleNavigate}
              className="bg-gray-200 px-2 text-primary rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-200"
            >
              Camuzzi
            </span>{" "}
            por confiar en nosotros, en estas charlas multitudinarias y abiertas
            a la comunidades de diferentes lugares del país, que seguiremos
            compartiendo. Gracias también por la donación de 4 banners, que
            fueron diseñados por nuestro socio Leonardo Hariyo. Gracias a
            nuestros instructores por llevar adelante las actividades con tanta
            pasión y pertenencia, utilizando sus equipos para cumplir con
            nuestro objetivo. Gracias a las Empresa ODD, fabricantes de los
            maniquíes, por la empatía, por facilitarnos la gestión, por los
            beneficios para nuestros socios. Seguimos avanzando y creciendo como
            asociación, con nuestro compromiso intacto de continuar luchando,
            para que la implementación de la Ley de muerte Súbita en la
            Argentina, sea una realidad que alcance a todos.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1749614466/20232_ussdxw.jpg"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1749614959/torsos_fxtbmp.jpg"
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2023",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            San Manuel .Loberia. El jueves 5 de octubre en el marco de la Semana
            del Corazón realizamos actividades donde participaron alumnos y
            docentes de las Escuelas primarias y secundarias. Gracias a todos
            los que asistieron. Gracias Sergio Marcos y equipo, por solo bajar
            los brazos para enseñar RCP. Seguimos luchando contra la muerte
            súbita.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1749614459/2023_jzgtrz.jpg"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1748923390/redes_n5ncln.jpg"
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2022",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Enseñamos RCP y ayudamos a bomberos que luchan contra el fuego en
            Corrientes
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/images/timeline/flayer2022-1.jpeg"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg h-28 md:h-48 lg:h-80 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="/images/timeline/flayer2022-2.jpeg"
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg h-28 md:h-48 lg:h-80 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2021",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Argentina Reanima. RCP/Heimlich Instituto Esperanza Pto. Iguazú
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747676654/puertoiguazu-1_ehcqpe.png"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747676818/puertoiguazu-2_jz1ume.png"
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-72 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans"
      ref={containerRef}
    >
      <div>
        <Titleh1
          title="Años de Compromiso, Minutos que Salvan: La Trayectoria de Argentina Reanima"
          className="text-lg md:text-4xl mb-4 text-black dark:text-white w-full"
        />

        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base w-full text-center">
          Con años de experiencia y compromiso inquebrantable, Argentina Reanima
          se ha consolidado como referente en formación y asistencia en
          Reanimación Cardiopulmonar (RCP). Nuestra misión es clara: Luchar
          contra la muerte súbita a través de la educación, la prevención y la
          acción rápida ante emergencias.
        </p>
      </div>

      <div ref={ref} className="pb-7 md:pb-16">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-7 md:pt-16 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 ">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
