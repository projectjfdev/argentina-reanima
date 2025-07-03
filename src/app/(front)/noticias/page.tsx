"use client";

import BannerHero from "@/components/BannerHero/BannerHero";
import { NewsSection } from "@/components/News/NewsSection";
import { seedDataYoutubeNews } from "@/components/News/SeedDataYoutubeNews";
import { SidebarNews } from "@/components/News/SidebarNews";
import SearchBar from "@/components/SearchBarComponent/SearchBarComponent";
import { SimplePagination } from "@/components/SimplePagination/SimplePagination";
import { Button } from "@/components/ui/button";
import { CardVideoNews } from "@/components/Video/card-video-news";
import { useNews } from "@/context/NewsContext";
import { useMobile } from "@/hooks/useMedia";

import React, { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 6;

const NoticiasPage = () => {
  const { loadNews, total } = useNews();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const isMobile = useMobile();

  const clearFilters = () => {
    setCategory("");
    setSearch("");
    loadNews("", "", 1);
  };

  useEffect(() => {
    loadNews(category, search, currentPage);
  }, [loadNews, search, category, currentPage]);

  return (
    <div className="flex flex-col  gap-7 md:gap-16">
      <BannerHero
        src={
          "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214527/Ca%C3%B1uelas-97_rpyvyl_amuuye.jpg"
        }
        srcMobile={
          "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214527/Ca%C3%B1uelas-97_rpyvyl_amuuye.jpg"
        }
        title="Novedades"
        description="Enterate de las últimas acciones, eventos y novedades de Argentina Reanima."
        imgClassname={isMobile ? "object-cover" : ""}
      />

      <div className="px-4 md:px-0 container mx-auto flex flex-col gap-7 md:gap-16 pb-7 md:pb-16">
        <div>
          <SearchBar
            onSearch={(query) => {
              setSearch(query);
            }}
          />
        </div>
        <div className="flex">
          <SidebarNews setCategory={setCategory} />
          <div className="flex flex-col gap-7 md:gap-16">
            <NewsSection />
            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            {(category || search) && (
              <Button
                variant="outline"
                className="mt-10 ml-16"
                onClick={clearFilters}
              >
                🧹 Limpiar filtros
              </Button>
            )}
            <CardVideoNews seedDataYoutubeNews={seedDataYoutubeNews} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticiasPage;
