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

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center w-full">
      <div className="absolute inset-0 -z-10">
        <Image
          src={selectedSrc}
          alt="Argentina Reanima"
          fill
          className={`${imgClassname}`}
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/40 w-full h-full" />
      </div>

      <div className="absolute container text-center text-white w-full">
        <BlurFade delay={0.25} inView>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-oswald ">
            {title}
          </h1>
          <h2 className="text-5xl md:text-7xl font-bold mb-4 font-oswald ">
            {secondTitle}
          </h2>
        </BlurFade>
        <BlurFade delay={0.25 * 2} inView>
          <p className="text-xl md:text-3xl italic whitespace-pre-line break-words w-full mx-auto max-w-3xl text-center">
            {description}
          </p>
        </BlurFade>
      </div>
    </div>
  );
}
