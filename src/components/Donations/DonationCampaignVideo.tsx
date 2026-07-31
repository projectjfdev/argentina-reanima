"use client";

import {
  getCanonicalYouTubeVideoUrl,
  isValidYouTubeUrl,
} from "@/libs/donations/youtubeVideo";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/youtube"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900" />,
});

export function DonationCampaignVideo({
  youtubeVideoUrl,
}: {
  youtubeVideoUrl: string | null | undefined;
}) {
  if (!youtubeVideoUrl || !isValidYouTubeUrl(youtubeVideoUrl)) {
    return null;
  }

  const playerUrl = getCanonicalYouTubeVideoUrl(youtubeVideoUrl);
  if (!playerUrl) return null;

  return (
    <section className="px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Lugar de instalación
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
              Conocé dónde juntos vamos a construir una nueva oportunidad.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Mirá el lugar que será equipado gracias a esta campaña y descubrí
              por qué fue elegido para recibir el próximo DEA.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-xl shadow-slate-900/10">
            <div className="aspect-video w-full">
              <ReactPlayer
                url={playerUrl}
                width="100%"
                height="100%"
                controls
                config={{
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
