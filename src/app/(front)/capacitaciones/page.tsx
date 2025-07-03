"use client";

import React, { useEffect, useState } from "react";
import BannerHero from "@/components/BannerHero/BannerHero";
import { SidebarCourses } from "@/components/Courses/SideBarCourses";
import { CoursesSection } from "@/components/Courses/CourseSection";
import SearchBar from "@/components/SearchBarComponent/SearchBarComponent";
import { useCourse } from "@/context/CourseContext";
import { SimplePagination } from "@/components/SimplePagination/SimplePagination";
import { Button } from "@/components/ui/button";
import { TextOneImage } from "@/components/TextImage/TextOneImage";
import { Charlas } from "@/components/Capacitaciones/Charlas";

const ITEMS_PER_PAGE = 6;

const CapacitacionesPage = () => {
  const { loadCourses, total } = useCourse();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setCategory("");
    setSearch("");
    loadCourses("", "", 1);
  };

  useEffect(() => {
    loadCourses(category, search, currentPage);
  }, [loadCourses, search, category, currentPage]);

  return (
    <div className="flex flex-col gap-7 md:gap-16">
      <BannerHero
        src={"/images/banner-capacitaciones.jpg"}
        srcMobile={"/images/banner-capacitaciones.jpg"}
        title="Capacitaciones"
        description="Aprendé técnicas de reanimación cardiopulmonar , USO DE DEA y maniobra de Heimlich con nuestros cursos diseñados para toda la comunidad."
        imgClassname={"object-cover md:object-[center_0px] md:object-fit"}
      />

      <div className="px-4 md:px-0 container mx-auto flex flex-col gap-7 md:gap-16 pb-7 md:pb-16">
        <SearchBar />
        <div className="flex">
          <SidebarCourses setCategory={setCategory} />
          <div className="flex flex-col gap-7 md:gap-16">
            <CoursesSection />
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
          </div>
        </div>
      </div>
      <div>
        <Charlas />
      </div>
      <div>
        <TextOneImage />
      </div>
    </div>
  );
};

export default CapacitacionesPage;
