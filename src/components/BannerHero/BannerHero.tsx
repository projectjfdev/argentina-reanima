"use client";

import Image from "next/image";
import { BlurFade } from "../Texts/BlurFade";
import { useEffect, useState } from "react";

interface BannerHeroProps {
  title?: string;
  secondTitle?: string;
  description?: string;
  src: string | null;
  imgClassname?: string;
  srcMobile: string;
}

export default function BannerHero({
  imgClassname,
  title,
  secondTitle,
  description,
  src,
  srcMobile,
}: BannerHeroProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // puedes ajustar el breakpoint
    };

    handleResize(); // set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedSrc = isMobile ? srcMobile : src || "";
  const hasContent = Boolean(title || secondTitle || description);

  return (
    <section className="relative isolate flex min-h-[92svh] w-full items-end overflow-hidden bg-slate-950 pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          src={selectedSrc}
          alt="Argentina Reanima"
          fill
          className={`${imgClassname}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/62" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/35 to-transparent" />
      </div>

      {hasContent && (
        <div className="container relative z-10 mx-auto px-4 pb-14 pt-36 md:pb-20 md:pt-48">
          <BlurFade delay={0.18} inView>
            <div className="max-w-3xl rounded-lg border border-white/20 bg-slate-950/65 p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-md md:p-7">
              {title && (
                <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                  {title}
                </h1>
              )}
              {secondTitle && (
                <h2 className="mt-3 text-2xl font-semibold leading-tight text-white/90 md:text-4xl">
                  {secondTitle}
                </h2>
              )}
              {description && (
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 md:text-lg md:leading-8">
                  {description}
                </p>
              )}
            </div>
          </BlurFade>
        </div>
      )}
    </section>
  );
}
