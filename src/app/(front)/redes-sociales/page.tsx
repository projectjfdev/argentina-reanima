"use client";

import BannerHero from "@/components/BannerHero/BannerHero";
import InstagramEmbed from "@/components/RedesSociales/InstagramEmbed";
import PDFViewer from "@/components/RedesSociales/PDFViewer";
import { Stats } from "@/components/Stats/Stats";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Facebook,
  FileText,
  Heart,
  Instagram,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import type { PointerEvent } from "react";
import { useRef } from "react";

const instagramPosts = [
  {
    label: "Instagram Reel",
    kind: "embed",
    url: "https://www.instagram.com/reel/CoalPgtDGhL/?igsh=a2pldzZtZHpxejJv",
  },
  {
    label: "Instagram Post",
    kind: "embed",
    url: "https://www.instagram.com/p/CnHaZbJumgG/?igsh=MWZvdHR5MHR5MXlxOA==",
  },
  {
    label: "Instagram Post",
    kind: "embed",
    url: "https://www.instagram.com/p/Cywu2HOMvv0/",
  },
  {
    label: "Instagram Reel",
    kind: "embed",
    url: "https://www.instagram.com/p/DK15t9tsDCP",
  },
  {
    label: "Instagram Post",
    kind: "image",
    url: "https://res.cloudinary.com/dtbryiptz/image/upload/v1747883997/rcp-no_gdwfiv.jpg",
  },
  {
    label: "Instagram Reel",
    kind: "embed",
    url: "https://www.instagram.com/p/CymHUYNKxVY/",
  },
  {
    label: "Instagram Post",
    kind: "embed",
    url: "https://www.instagram.com/p/CxwQYf9sE9V/?img_index=5",
  },
  {
    label: "Instagram Post",
    kind: "embed",
    url: "https://www.instagram.com/p/CxosKarMmnB/",
  },
  {
    label: "Instagram Post",
    kind: "embed",
    url: "https://www.instagram.com/p/Cw3k-YLsDvW/",
  },
  {
    label: "Instagram Post",
    kind: "embed",
    url: "https://www.instagram.com/p/CvTAJkEPYyl/",
  },
];

const stats = [
  { icon: Users, label: "Muertes al ano en el pais", value: "40000" },
  { icon: Heart, label: "Fuera del ambito hospitalario", value: "70%" },
  {
    icon: TrendingUp,
    label:
      "Probabilidad de sobrevida. RCP + DEA dentro de los primeros 4 minutos",
    value: "+70%",
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  );
}

function InstagramCard({
  post,
  index,
}: {
  post: (typeof instagramPosts)[number];
  index: number;
}) {
  return (
    <article className="snap-start scroll-ml-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/6 transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary/30 hover:shadow-xl hover:shadow-slate-900/10 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">{post.label}</p>
            <p className="text-xs text-slate-500">Publicacion #{index + 1}</p>
          </div>
        </div>
      </div>

      <div className="aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
        {post.kind === "image" ? (
          <Image
            src={post.url}
            width={800}
            height={800}
            alt="Campana Con la RCP NO"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full overflow-auto bg-white">
            <InstagramEmbed url={post.url} />
          </div>
        )}
      </div>
    </article>
  );
}

const RedesSocialesPage = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const shouldReduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    carousel.scrollBy({
      left: direction === "right" ? 420 : -420,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    isDragging.current = true;
    dragStartX.current = event.clientX;
    dragStartScrollLeft.current = carousel.scrollLeft;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel || !isDragging.current) return;

    event.preventDefault();
    carousel.scrollLeft =
      dragStartScrollLeft.current - (event.clientX - dragStartX.current);
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-white text-slate-950">
      <BannerHero
        src="https://res.cloudinary.com/dtbryiptz/image/upload/v1748923390/redes_n5ncln.jpg"
        srcMobile="https://res.cloudinary.com/dtbryiptz/image/upload/v1748923390/redes_n5ncln.jpg"
        title="Redes Sociales"
        description="Seguinos en nuestras redes sociales para acceder a contenido educativo, novedades, campañas y recursos que ayudan a construir una comunidad más preparada para actuar ante una emergencia."
      />

      <div className="absolute inset-x-0 top-[70vh] -z-10 h-[42rem] bg-[linear-gradient(180deg,rgba(44,156,193,0.08),rgba(255,255,255,0))]" />

      <Stats stats={stats} />

      <main className="relative">
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Comunidad digital
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Con la RCP NO.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Descubre nuestro contenido educativo y unite a nuestra comunidad
              comprometida con salvar vidas.
            </p>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50/70 py-14 md:py-18">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                eyebrow="Instagram"
                title="Contenido educativo para compartir y aprender"
                description="Publicaciones, reels y campañas."
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Ver publicaciones anteriores"
                  onClick={() => scrollCarousel("left")}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-[transform,border-color,box-shadow,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary/40 hover:text-primary hover:shadow-md active:scale-[0.97] motion-reduce:transition-none"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Ver mas publicaciones"
                  onClick={() => scrollCarousel("right")}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-[transform,border-color,box-shadow,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary/40 hover:text-primary hover:shadow-md active:scale-[0.97] motion-reduce:transition-none"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onPointerLeave={stopDragging}
              className="-mx-4 cursor-grab touch-pan-x select-none overflow-x-auto px-4 pb-4 active:cursor-grabbing [scrollbar-width:thin] [scrollbar-color:rgba(44,156,193,0.5)_transparent]"
            >
              <div className="grid auto-cols-[minmax(280px,82vw)] grid-flow-col gap-5 snap-x snap-mandatory sm:auto-cols-[minmax(340px,390px)] lg:auto-cols-[minmax(360px,390px)]">
                {instagramPosts.map((post, index) => (
                  <InstagramCard
                    key={`${post.url}-${index}`}
                    post={post}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto grid max-w-5xl justify-items-center gap-6 md:grid-cols-2 md:items-start">
            <article className="w-full max-w-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/6">
              <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(44,156,193,0.08),rgba(253,45,43,0.05))] p-4 md:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-secondary shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Colaboracion Especial
                  </p>
                </div>
                <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-950 md:text-2xl">
                  Julian Weich tambien lucha contra la muerte subita
                </h2>
              </div>

              <div className="p-4">
                <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <Instagram className="h-4 w-4 text-primary" />
                  Colaboracion Especial
                </div>
                <div className="max-h-[520px] overflow-y-auto rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  <InstagramEmbed url="https://www.instagram.com/p/CSzQYtXgY2t/" />
                </div>
              </div>
            </article>

            <article className="w-full max-w-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/6">
              <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(44,156,193,0.08),rgba(16,185,129,0.06))] p-4 md:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <Scale className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Marco Legal
                  </p>
                </div>
                <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-950 md:text-2xl">
                  El Compromiso continua Ley 27.159
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Comprometidos con el cumplimiento de la legislacion vigente en
                  materia de RCP.
                </p>
              </div>

              <div className="p-4">
                <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-primary" />
                  Informacion Legal
                </div>
                <div className="max-h-[520px] overflow-y-auto rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  <InstagramEmbed url="https://www.instagram.com/p/CmEwMU2r6fF/?utm_source=ig_embed&amp;utm_campaign=loading" />
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50/70 px-4 py-14 md:py-18">
          <div className="container mx-auto">
            <div className="mx-auto max-w-[500px] text-center">
              <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Material de consulta
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Documento informativo
              </h2>
              </div>
              <PDFViewer />
            </div>
          </div>
        </section>

        <Separator className="bg-slate-200" />

        {/* Call to Action */}
        <section className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-to-r from-[primary] to-[secondary}] rounded-3xl blur-3xl opacity-10 scale-110" />
            <div className="relative bg-gradient-to-r from-primary to-red-600 rounded-3xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">
                Â¡Seguinos en Nuestras Redes!
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Mantente actualizado con nuestros Ãºltimos contenidos educativos
                y unite a nuestra comunidad
              </p>
              <div className="flex flex-col  md:flex-row items-center gap-5 justify-center">
                <button
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() =>
                    window.open(
                      "https://www.instagram.com/argentinareanimaac/",
                      "_blank",
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-6 h-6" />
                    Seguir en Instagram
                  </div>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/profile.php?id=100087258240312",
                      "_blank",
                    )
                  }
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Facebook className="w-6 h-6" />
                    Seguir en Facebook
                  </div>
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/channel/UCUe7YAlQawPP9VHg_1B172w",
                      "_blank",
                    )
                  }
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Youtube className="w-6 h-6" />
                    Seguir en Youtube
                  </div>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.tiktok.com/@argentina.reanima",
                      "_blank",
                    )
                  }
                  className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="20"
                      height="20"
                      className="fill-current -mb-2"
                    >
                      <path d="M208.005 78.284a78.366 78.366 0 0 1-43.999-13.224v74.941a63.96 63.96 0 1 1-63.96-63.96c1.792 0 3.56.088 5.3.255v35.994a28.06 28.06 0 1 0 28.06 28.06V0h33.457a44.823 44.823 0 0 0 6.435 22.847c7.934 13.285 22.347 22.176 38.707 22.947v32.49z" />
                    </svg>
                    Seguir en TikTok
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RedesSocialesPage;
