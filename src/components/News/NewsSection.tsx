"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useState } from "react";
import { useNews } from "@/context/NewsContext";
import { Titleh1 } from "../Texts/Titleh1";
import Link from "next/link";

const NewsSection = () => {
  const { news } = useNews();
  const [expandedSummaries, setExpandedSummaries] = useState<
    Record<string, boolean>
  >({});

  const toggleSummary = (newsId: string) => {
    setExpandedSummaries((prev) => ({
      ...prev,
      [newsId]: !prev[newsId],
    }));
  };
  return (
    <section>
      <div className="container mx-auto flex flex-col items-center   gap-7 md:gap-16 lg:px-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 text-white">
            Ultimas Novedades
          </Badge>
          <Titleh1 title="Actualidad" className="mb-4" />
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            Entérate de las últimas acciones, eventos y novedades de Argentina
            Reanima.
          </p>
          <Button variant="link" className="w-full sm:w-auto" asChild>
            <Link href={"/noticias#videos"}>
              Noticias en acción
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {news?.map((singleNew) => {
            const isExpanded = expandedSummaries[singleNew.id];
            const isLong = singleNew.description.length > 100;
            const summaryText = isExpanded
              ? singleNew.description
              : singleNew.description.slice(0, 100) + (isLong ? "..." : "");

            return (
              <Card
                key={singleNew.id}
                className="grid grid-rows-[auto_auto_1fr_auto]"
              >
                <div className="aspect-[16/9] w-full relative">
                  {singleNew.dateNew && (
                    <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                      {new Date(singleNew.dateNew).toLocaleDateString()}
                    </div>
                  )}

                  <a
                    href={singleNew.redirect}
                    target="_blank"
                    className="transition-opacity duration-200 fade-in"
                  >
                    {singleNew.imageUrl ? (
                      <Image
                        src={singleNew.imageUrl}
                        alt={singleNew.title}
                        className="h-full w-full object-cover object-center"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <Image
                        src="/images/noticia-generica.jpg"
                        alt={singleNew.title}
                        className="h-full w-full object-cover object-center"
                        width={40}
                        height={40}
                      />
                    )}
                  </a>
                </div>

                <CardContent className="p-4">
                  <CardHeader>
                    <h3 className="text-lg font-semibold hover:underline md:text-xl">
                      <a
                        href={singleNew.redirect}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {singleNew.title} - {singleNew.category}
                      </a>
                    </h3>
                  </CardHeader>

                  <p className="text-muted-foreground">
                    {summaryText}
                    {isLong && (
                      <button
                        onClick={() => toggleSummary(singleNew.id.toString())}
                        className="ml-2 text-blue-500 hover:underline cursor-pointer"
                      >
                        {isExpanded ? "Leer menos" : "Leer más..."}
                      </button>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { NewsSection };
