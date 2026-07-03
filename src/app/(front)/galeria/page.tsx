"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  VideoIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const IMAGES_1 = [
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025565/20_bu3dgh.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025565/21_yzq9bm.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025564/19_huaknf.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025563/18_yfpugb.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/10_mavcsy.jpg",
];
const IMAGES_2 = [
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025563/17_qafdjy.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025562/16_kcqdww.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025562/8_uuq2y8.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025562/15_vuhwiv.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025560/14_opxs9v.jpg",
];
const IMAGES_3 = [
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/12_zbb2to.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/13_wvo6zd.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/5_o0bm0v.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/6_ucuoli.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025560/11_d4diy5.jpg",
];

const galleryImages = [...IMAGES_1, ...IMAGES_2, ...IMAGES_3].map(
  (src, index) => ({
    src,
    alt: `Actividad de Argentina Reanima ${index + 1}`,
  }),
);

const GaleriaPage = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : galleryImages[activeIndex];

  const featuredImages = useMemo(() => galleryImages.slice(0, 3), []);

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === null
        ? current
        : (current - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const goToNext = () => {
    setActiveIndex((current) =>
      current === null ? current : (current + 1) % galleryImages.length,
    );
  };

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") goToPrevious();
      if (event.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  return (
    <main className="bg-white pt-24 text-slate-950">
      <section className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Galería institucional
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Nuestra historia en acción, en cada rincon del país.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            Recorré imágenes de nuestras capacitaciones, actividades y espacios
            de encuentro con la comunidad.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 gap-2 border-slate-300 px-5"
              onClick={() => router.push("/quienes-somos")}
            >
              Sobre nosotros <BookOpen className="size-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="grid min-h-[360px] grid-cols-5 grid-rows-2 gap-3 md:min-h-[460px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
        >
          {featuredImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={`group relative overflow-hidden rounded-lg bg-slate-100 shadow-sm ${
                index === 0
                  ? "col-span-5 row-span-1 md:col-span-3 md:row-span-2"
                  : "col-span-5 md:col-span-2"
              }`}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes={
                  index === 0
                    ? "(min-width: 768px) 50vw, 100vw"
                    : "(min-width: 768px) 35vw, 100vw"
                }
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent opacity-70 transition group-hover:opacity-45" />
              <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-slate-950 opacity-0 shadow-sm transition group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </div>
            </button>
          ))}
        </motion.div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              Nuestra historia en fotos
            </h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
            {galleryImages.length} imagenes
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image, index) => (
            <motion.button
              key={image.src}
              type="button"
              className={`group relative overflow-hidden rounded-lg bg-slate-100 text-left shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-lg ${
                index % 7 === 0 ? "sm:col-span-2" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <div
                className={
                  index % 7 === 0
                    ? "relative aspect-[16/9]"
                    : "relative aspect-[4/3]"
                }
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={
                    index % 7 === 0
                      ? "(min-width: 1024px) 66vw, 100vw"
                      : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  }
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/20" />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-xs font-semibold text-slate-950 opacity-0 shadow-sm transition group-hover:opacity-100">
                  Ampliar <Maximize2 className="h-3.5 w-3.5" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {activeImage && (
          <motion.div
            className="fixed inset-0 z-[80] bg-slate-950/90 px-4 py-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="Imagen ampliada de galeria"
            onClick={() => setActiveIndex(null)}
          >
            <div className="mx-auto flex h-full max-w-7xl flex-col">
              <div className="mb-4 flex items-center justify-between gap-3 text-white">
                <div className="text-sm font-medium text-white/75">
                  Imagen {(activeIndex ?? 0) + 1} de {galleryImages.length}
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white hover:text-slate-950"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveIndex(null);
                  }}
                  aria-label="Cerrar galeria"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-black"
                onClick={(event) => event.stopPropagation()}
              >
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 md:left-5"
                  onClick={goToPrevious}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 md:right-5"
                  onClick={goToNext}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-white/65">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNext();
                  }}
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default GaleriaPage;
