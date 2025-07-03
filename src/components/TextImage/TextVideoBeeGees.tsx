"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("../Video/video-player"), {
  ssr: false,
});

function TextVideoBeeGees() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full px-4 max-w-7xl">
        <div className="relative overflow-hidden">
          {/* VIDEO A LA DERECHA EN DESKTOP */}
          <div className="float-none md:float-right w-full lg:w-[40vw] h-[500px] md:ml-6 mb-4">
            <Suspense fallback={<div>Cargando video...</div>}>
              <VideoPlayer
                src="https://www.youtube.com/watch?v=RAJHlryxTGw"
                height="500px"
              />
            </Suspense>
          </div>

          {/* TEXTO A LA IZQUIERDA */}
          <div className="text-left text-muted-foreground text-lg leading-relaxed tracking-tight">
            <h2 className="text-3xl font-semibold mb-4">
              🎶 ¡Gracias, Bee Gees! Ahora, Argentina Reanima marca el ritmo. 🎶
            </h2>
            <p className="mb-4">
              Por años, Stayin Alive fue la canción que nos ayudó a mantener el
              ritmo correcto para hacer RCP.
            </p>
            <p className="mb-4">
              Pero hoy damos un paso más: presentamos{" "}
              <b>Pregunta por la Vida</b>, nuestro propio himno para
              concientizar sobre la importancia del RCP y el DEA en las
              escuelas.
            </p>
            <p className="mb-4">
              📢 Cuando los padres dejan a sus hijos en la escuela, confían en
              que estarán seguros. Se preocupan por los libros, los horarios y
              los viajes, pero pocas veces se preguntan:
            </p>
            <p className="mb-4">❗ ¿Hay alguien capacitado en RCP?</p>
            <p className="mb-4">❗ ¿La escuela cuenta con un DEA?</p>
            <p className="mb-4">
              ❗ ¿Está realmente preparada para responder ante una emergencia?
            </p>
            <p className="mb-4">
              La Ley de Muerte Súbita ya está vigente, pero debe ser
              implementada. No esperemos a que sea demasiado tarde.
            </p>
            <p className="mb-4">
              💬 Pregunta por la vida en la escuela de tus hijos. Exijamos
              escuelas cardioasistidas. ¡Disponible para todos los instructores!
            </p>
            <p>
              #GraciasBeeGees #PreguntaPorLaVida #ArgentinaReanimaAC #RCP #DEA
              #EscuelasCardioasistidas #SoloBajamosLosBrazosParaHacerRCP
            </p>
          </div>

          {/* CLEAR FLOAT */}
          <div className="clear-both" />
        </div>
      </div>
    </div>
  );
}

export { TextVideoBeeGees };
