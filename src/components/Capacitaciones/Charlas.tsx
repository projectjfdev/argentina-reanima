import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import { Titleh1 } from "../Texts/Titleh1";

const VideoPlayer = dynamic(() => import("@/components/Video/video-player"), {
  ssr: false,
});

export const Charlas = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 lg:px-16 flex flex-col items-center text-center gap-6 md:gap-10">
        <Titleh1 title="Te invitamos a ver y escuchar" />
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
          Aquí reunimos charlas y testimonios que nos movilizan. Creemos que
          pueden ayudarte a tomar verdadera dimensión de lo fundamental que es
          saber hacer RCP, usar un DEA y generar entornos cardio asistidos. Cada
          historia nos recuerda que todos podemos hacer la diferencia.
        </p>
      </div>

      <div className="container mx-auto mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-2 px-4 lg:px-16">
        {/* Charla 1 */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
          <div className="aspect-video">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Cargando video...
                    </p>
                  </div>
                </div>
              }
            >
              <VideoPlayer src="https://www.youtube.com/watch?v=mVmooTuqmfI" />
            </Suspense>
          </div>
          <div className="p-6 space-y-2">
            <h4 className="text-lg font-semibold text-foreground">
              Dr. Mario Fitz Maurice
            </h4>
            <p className="text-sm text-muted-foreground">
              Te invitamos a disfrutar de esta charla.
            </p>
          </div>
        </div>

        {/* Charla 2 */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
          <div className="aspect-video">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Cargando video...
                    </p>
                  </div>
                </div>
              }
            >
              <VideoPlayer src="https://www.youtube.com/watch?v=FidfJQX9KCk&t=1s" />
            </Suspense>
          </div>
          <div className="p-6 space-y-2">
            <h4 className="text-lg font-semibold text-foreground">
              ¿Tenés hijos en edad escolar?
            </h4>
            <p className="text-sm text-muted-foreground">
              Escuchá al Presidente de nuestra Asociación, Lic. Sergio Felice, y
              empezá a preguntar por la vida.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
