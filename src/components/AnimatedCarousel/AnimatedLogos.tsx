"use client";

import { AnimatedVerticalCarousel } from "./AnimatedVerticalCarousel";

export function AnimatedLogos() {
  return (
    <AnimatedVerticalCarousel
      testimonials={[
        {
          id: 1,
          name: "CONVENIO CON LA FEDERACION ARGENTINA DE CARDIOLOGIA . FAC",
          company: "Asociación Civil Argentina Reanima",
          content: `¡Vamos por el buen camino!
Nos enorgullece anunciar la firma de un Convenio Marco de Cooperación entre la Federación Argentina de Cardiología (FAC) y Argentina Reanima (ACAR).
Este acuerdo avala nuestras capacitaciones y reafirma nuestro compromiso con la comunidad para seguir luchando contra la muerte súbita a través de la enseñanza del RCP.
Ampliamos nuestras capacitaciones en empresas, escuelas, clubes y entidades públicas y privadas.
Formamos nuevos voluntarios e instructores para fortalecer nuestra red de rescate.
Promovemos la Ley 27.159, concientizando sobre la importancia de la cardioprotección.
Realizamos jornadas en fechas clave, como el Día de la RCP y el Día Mundial del Corazón.
Este convenio es un gran paso que confirma que estamos haciendo las cosas bien. Sigamos trabajando juntos para salvar vidas.
14/3/2025`,

          avatar:
            "https://res.cloudinary.com/dtbryiptz/image/upload/v1747672052/fac-logo_ghhy7j.png",
        },
        {
          id: 2,
          name: "TOMAMOS EXAMEN A FUTUROS INSTRUCTORES UNIVERSITARIOS DE FAC",
          company: "Asociación Civil Argentina Reanima",
          content: `La Plata. Buenos Aires. 22 de marzo de 2025
En el marco de la responsabilidad que nos confió con orgullo la Federación Argentina de Cardiología (@fac_cardio), llevamos a cabo el examen práctico de cinco nuevos instructores de RCP y DEA.
Junto al Dr. André Rossi (@andrericardorossi), a quien agradecemos por su hospitalidad y profesionalismo, logramos cumplir un nuevo desafío para nuestra Asociación. Esta instancia forma parte del convenio recientemente firmado en Mar del Plata con esta prestigiosa sociedad científica.
Agradecemos a todos los asistentes que viajaron desde distintos puntos de Buenos Aires y CABA para completar su formación.
Un reconocimiento especial a todo el equipo de Argentina Reanima, que trabaja incansablemente con pasión y compromiso, sin perder de vista nuestros valores y objetivos. Este esfuerzo constante nos impulsa a seguir creciendo y nos reafirma que estamos en el camino correcto.
Seguimos profesionalizando la capacitación para luchar contra la muerte súbita.
Solo bajamos los brazos para hacer RCP.`,

          avatar:
            "https://res.cloudinary.com/dtbryiptz/image/upload/v1747672053/IUFAC-logo_wqwxz7.png",
        },
        {
          id: 3,
          name: "¡Argentina Reanima en el XLII Congreso Argentino de Cardiología!",
          company: "Asociación Civil Argentina Reanima",
          content: `Participar de un evento de esta jerarquía fue un verdadero honor para nuestra asociación. Haber sido parte del equipo de la Secretaría de RCP y Muerte Súbita de la FAC representa un paso muy importante en nuestro camino como organización.
Vivimos una jornada intensa, de mucho trabajo, compromiso y camaradería junto a un gran grupo de profesionales.
A las 09:00 hs realizamos un taller de RCP y manejo de la vía aérea, ¡con auditorio completo!
Luego tomamos examen a 22 futuros instructores FAC, llegados desde distintas provincias del país.
Y a las 17:00 hs, con la presencia de las máximas autoridades de la FAC, participamos de la primera reunión de instructores universitarios, donde se compartieron experiencias, proyectos, y se continuó enseñando RCP a través de competencias dinámicas y pedagógicas que todos disfrutamos.
Queremos agradecer profundamente a la Fundación Argentina Cardiología (FAC) y a su Secretaría de RCP por abrirnos las puertas y permitirnos ser parte de este equipo. Fue un orgullo para nuestra Asociación aportar desde nuestro lugar.
Seguimos creciendo, convencidos de que vamos por el buen camino: el de la capacitación, el trabajo conjunto, el aprendizaje permanente y la lucha constante contra la muerte súbita.
¡Solo bajamos los brazos para hacer RCP!`,

          avatar:
            "https://res.cloudinary.com/dtbryiptz/image/upload/v1747672052/logofac-logo_cgycz8.png",
        },
      ]}
    />
  );
}
