"use client";

import { ArrowRight, Heart, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface DonationBannerProps {
  href?: string;
  message?: string;
  cta?: string;
}

export const DonationBanner = ({
  href = "/donar",
  message = "QUIERO SER PARTE",
  cta = "de una nueva oportunidad.",
}: DonationBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative border-t border-primary/10 bg-primary/10 transition-colors duration-200 hover:bg-primary/15">
      <Link
        href={href}
        className="group flex min-h-11 w-full items-center justify-center px-12 py-2 text-center text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset md:min-h-12"
        aria-label={`${message} ${cta}`}
      >
        <span className="flex max-w-5xl flex-wrap items-center justify-center gap-x-2 gap-y-1 leading-6">
          <Heart className="h-4 w-4 fill-primary text-primary" />
          <span>{message}</span>
          <span className="font-semibold text-primary underline decoration-primary/35 underline-offset-4">
            {cta}
          </span>
          <ArrowRight className="h-4 w-4 text-primary transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </Link>
      <button
        type="button"
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-white/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Cerrar aviso de donaciones"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
