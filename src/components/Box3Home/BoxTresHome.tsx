"use client";

import { News } from "@/generated/prisma";
import { cn } from "@/libs/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const BoxTresHome = () => {
  const [news, setNews] = useState<News[]>();

  const getNews = async () => {
    const res = await fetch("/api/news/lastThreeNews");
    const data = await res.json();
    setNews(data.news);
  };

  useEffect(() => {
    getNews();
  }, []);

  return (
    <div className="container mx-auto grid w-full grid-cols-1 gap-5 px-0 lg:grid-cols-2 xl:grid-cols-3">
      {news?.map((card) => (
        <div
          key={card.id}
          className="group/card w-full"
          onClick={() => window.open(card.redirect, "_blank")}
        >
          <div
            className={cn(
              "card relative flex h-[360px] cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-cover bg-center p-5 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30"
            )}
            style={{
              backgroundImage: `url(${
                card.imageUrl ? card.imageUrl : "/images/noticia-generica.jpg"
              })`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20 transition duration-300 group-hover/card:from-slate-950 group-hover/card:via-slate-950/80" />

            <div className="z-10 flex flex-row items-center gap-3">
              <Image
                height={100}
                width={100}
                alt={card.title}
                src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747751406/logo_compress_gxgwwh.png"
                className="h-10 w-10 rounded-full border border-white/50 object-cover"
              />
              <div className="flex flex-col">
                <p className="relative z-10 text-sm font-medium text-white/90">
                  Argentina Reanima
                </p>
              </div>
            </div>

            <div className="content z-10">
              <h3 className="text-xl font-semibold leading-tight text-white md:text-2xl">
                {card.title}
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="my-4 cursor-help text-start text-sm leading-6 text-white/80">
                      {card.description.slice(0, 100)}...
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>{card.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
