"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("../Video/video-player"), {
  ssr: false,
});

function TextVideoPalmeras() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full px-4 max-w-7xl">
        <div className="relative overflow-hidden">
          {/* VIDEO A LA DERECHA EN DESKTOP */}
          <div className="float-none md:float-right w-full lg:w-[40vw] h-[500px] md:ml-6 mb-4">
            <Suspense fallback={<div>Cargando video...</div>}>
              <VideoPlayer
                src="https://www.youtube.com/watch?v=h0WMx4qL7-E"
                height="500px"
              />
            </Suspense>
          </div>

          {/* TEXTO A LA IZQUIERDA */}
          <div className="text-left text-muted-foreground text-lg leading-relaxed tracking-tight">
            <h2 className="text-3xl font-semibold mb-4">
              🎶💓 Nuevo tema de Argentina Reanima 💓🎶
            </h2>
            <p className="mb-4">
              Esta vez, con la inconfundible música de Los Palmeras, lanzamos
              una canción que te va a hacer mover… y también pensar.
            </p>
            <p className="mb-4">
              Un ritmo ideal para practicar RCP y una letra que invita a
              reflexionar sobre las más de 40.000 muertes súbitas que ocurren
              cada año en Argentina.
            </p>
            <p className="mb-4">
              Porque la música también puede salvar vidas. Ayudanos a seguir
              luchando contra la muerte súbita.
            </p>
            <p className="mb-4">
              🎤 Gracias a Martín Pradas y Morena Felice por sus voces y
              arreglos.
            </p>
            <p>📺 Escuchalo ya en YouTube</p>
            <p>🎧 Muy pronto en Spotify</p>
            <p className="mb-4">💬 Compartilo, comentá y sumate.</p>
            <p className="mb-4">
              ❗ ¿Está realmente preparada para responder ante una emergencia?
            </p>
            <p>
              #ArgentinaReanimaac #RCP #CumbiaQueInspira #LosPalmeras
              #MuerteSubita #Solobajamoslos brazosparahacerrcp
            </p>
          </div>

          {/* CLEAR FLOAT */}
          <div className="clear-both" />
        </div>
      </div>
    </div>
  );
}

export { TextVideoPalmeras };
