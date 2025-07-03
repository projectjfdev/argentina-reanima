"use client";

import { SidebarContent } from "@/components/Dashboard/SidebarContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/libs/utils";
import { Newspaper, School } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function DashboardPage() {
  const features = [
    {
      title: "Noticias",
      href: "/dashboard/noticias",
      description:
        "Creá las últimas noticias para mantener informada a tu comunidad.",
      icon: <Newspaper />,
      cta: "Crear Noticia",
    },
    {
      title: "Cursos",
      href: "/dashboard/cursos",
      description:
        "Creá y gestioná tus cursos para ofrecer contenido de calidad a tus usuarios.",
      icon: <School />,
      cta: "Ir a Cursos",
    },
  ];
  return (
    <SidebarContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  relative z-10 py-10 md:max-w-7xl mx-auto  gap-10">
        {features.map((feature, index) => (
          <Card key={feature.title} className="h-[250px]">
            <Feature {...feature} index={index} />
          </Card>
        ))}
      </div>
    </SidebarContent>
  );
}

const Feature = ({
  title,
  description,
  href,
  icon,
  cta,
  index,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  cta: string;
  index: number;
}) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(href)}
      className={cn(
        "flex flex-col   gap-1  py-7 relative group/feature dark:border-neutral-800 cursor-pointer",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && " dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="group-hover/feature:translate-x-2 transition duration-200 mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="group-hover/feature:translate-x-2 transition duration-200 text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10 mb-2">
        {description}
      </p>
      <div className=" group-hover/feature:translate-x-2 transition duration-200 mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400  ">
        <Button className="text-sm  dark:text-neutral-300  w-fit relative z-10 px-10 text-white">
          {cta}
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
