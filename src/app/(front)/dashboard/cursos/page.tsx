"use client";

import CourseCard from "@/components/Dashboard/Courses/CourseCard";
import FormCreateCourse from "@/components/Dashboard/Courses/FormCreateCourse";
import { SidebarContent } from "@/components/Dashboard/SidebarContent";
import { SimplePagination } from "@/components/SimplePagination/SimplePagination";
import { Accordion } from "@/components/ui/accordion";
import { useCourse } from "@/context/CourseContext";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 6;

const NoticiasDashboardPage = () => {
  const { courses, loadCourses, total } = useCourse();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    loadCourses("", "", currentPage);
  }, [currentPage]);

  return (
    <SidebarContent>
      <div className="flex flex-col lg:flex-row items-center justify-around w-full h-full">
        <FormCreateCourse />

        <div className="px-3 pb-7 md:pb-0 md:px-0 flex w-full md:w-[600px] flex-col space-y-4 rounded-lg border md:p-4    ">
          <Accordion
            type="single"
            collapsible
            className="w-full px-6 "
            defaultValue="3"
          >
            {courses
              .slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
              )
              .map((n) => (
                <CourseCard n={n} key={n.id} />
              ))}
          </Accordion>

          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </SidebarContent>
  );
};

export default NoticiasDashboardPage;
