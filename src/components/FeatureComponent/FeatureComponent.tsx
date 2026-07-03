"use client";

import { cn } from "@/libs/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Titleh1 } from "../Texts/Titleh1";

interface Feature {
  step: string;
  title?: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  title?: string;
  autoPlayInterval?: number;
  imageHeight?: string;
}

export const features = [
  {
    step: "Step 1",
    title: "Aprende lo esencial",
    content:
      "Flexible y accesible: capacitaciones que se adaptan a vos. Aprende cuando y donde quieras, a tu propio ritmo.",
    image: "/images/2.jpeg",
  },
  {
    step: "Step 2",
    title: "Formacion combinada",
    content:
      "En Argentina Reanima ofrecemos cursos con modalidades mixtas para una formacion completa, practica y flexible.",
    image:
      "https://res.cloudinary.com/dtbryiptz/image/upload/v1747443444/step2_mdfnqi.jpg",
  },
  {
    step: "Step 3",
    title: "RCP y uso de DEA al alcance de todos",
    content:
      "Adquiri los conocimientos necesarios para actuar ante una emergencia. Aprende a realizar RCP y a utilizar desfibriladores externos automaticos (DEA) con seguridad y confianza. Lo anterior aplicado a adultos, ninos y lactantes.",
    image: "/images/5.jpeg",
  },
];

export function FeatureSteps({
  features,
  className,
  title,
  autoPlayInterval = 3000,
  imageHeight = "h-[420px]",
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={cn(className)}>
      <div className="container mx-auto w-full">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Formacion
          </p>
          <Titleh1
            title={title || ""}
            className="items-start [&>h1]:text-left"
          />
        </div>

        <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-12">
          <div className="order-2 space-y-5 md:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={feature.step}
                className={cn(
                  "flex gap-5 rounded-lg border p-5 transition-colors",
                  index === currentFeature
                    ? "border-primary/30 bg-primary/5"
                    : "border-slate-200 bg-white"
                )}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.72 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm",
                    index === currentFeature
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  )}
                >
                  {index <= currentFeature ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-950 md:text-xl">
                    {feature.title || feature.step}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className={cn(
              "relative order-1 overflow-hidden rounded-lg md:order-2",
              imageHeight
            )}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={feature.step}
                      className="absolute inset-0 overflow-hidden rounded-lg"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title || feature.step}
                        className="h-full w-full object-cover"
                        width={1000}
                        height={500}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
