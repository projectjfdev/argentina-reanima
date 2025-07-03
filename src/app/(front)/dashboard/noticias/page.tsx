"use client";

import FormCreateNews from "@/components/Dashboard/News/FormCreateNews";
import NewsCard from "@/components/Dashboard/News/NewsCard";
import { SidebarContent } from "@/components/Dashboard/SidebarContent";
import { Accordion } from "@/components/ui/accordion";
import { SimplePagination } from "@/components/SimplePagination/SimplePagination";
import { useNews } from "@/context/NewsContext";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 6;

const NoticiasDashboardPage = () => {
  const { news, loadNews, total } = useNews();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    loadNews("", "", currentPage);
  }, [loadNews, currentPage]);

  return (
    <SidebarContent>
      <div className="flex flex-col lg:flex-row items-center justify-around w-full h-full">
        <FormCreateNews />
        <div className="px-3 pb-7 md:pb-0 md:px-0 flex w-full md:w-[600px] flex-col space-y-4 rounded-lg border md:p-4    ">
          <Accordion
            type="single"
            collapsible
            className="w-full px-6 "
            defaultValue="3"
          >
            {news?.map((n) => (
              <NewsCard n={n} key={n.id} />
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
