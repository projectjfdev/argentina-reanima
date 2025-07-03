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
    <div className="grid grid-cols-1 px-0 container  lg:grid-cols-2 xl:grid-cols-3 justify-center w-full items-center mx-auto gap-4">
      {news?.map((card) => (
        <div
          key={card.id}
          className=" w-full group/card"
          onClick={() => window.open(card.redirect, "_blank")}
        >
          <div
            className={cn(
              "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl flex flex-col justify-between p-4 bg-cover"
            )}
            style={{
              backgroundImage: `url(${
                card.imageUrl ? card.imageUrl : "/images/noticia-generica.jpg"
              })`,
            }}
          >
            <div className="absolute w-full h-full top-0 left-0 bg-black/50 transition duration-300 group-hover/card:bg-black opacity-60" />

            <div className="flex flex-row items-center md:space-x-4 z-10 ">
              <Image
                height={100}
                width={100}
                alt={card.title}
                src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747751406/logo_compress_gxgwwh.png"
                className="h-10 w-10 rounded-full border-2 object-cover"
              />
              <div className="flex flex-col">
                <p className="font-normal text-base text-gray-50 relative z-10">
                  Argentina Reanima
                </p>
              </div>
            </div>

            <div className="text content z-10">
              <h1 className="font-bold text-xl md:text-2xl text-gray-50">
                {card.title}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="font-normal text-sm text-gray-50 my-4 text-start cursor-help">
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
