"use client";

import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useCourse } from "@/context/CourseContext";
import Link from "next/link";
import { CommingSoonCards } from "./ComingSoon";
import { Titleh1 } from "../Texts/Titleh1";

const CoursesSection = () => {
  const { courses } = useCourse();
  // mockCourses.ts

  // const courses = [
  //   {
  //     id: 1,
  //     title: "Introducción a React",
  //     category: "Desarrollo Web",
  //     lessons: [
  //       {
  //         title: "¿Qué es React y cómo funciona?",
  //         href: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
  //       },
  //       {
  //         title: "Componentes y Props",
  //         href: "https://www.youtube.com/watch?v=Rh3tobg7hEo",
  //       },
  //       {
  //         title: "Estado y Ciclo de Vida",
  //         href: "https://www.youtube.com/watch?v=DLX62G4lc44",
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     title: "Diseño UX/UI para principiantes",
  //     category: "Diseño",
  //     lessons: [
  //       {
  //         title: "Qué es UX y por qué importa",
  //         href: "https://www.youtube.com/watch?v=Ovj4hFxko7c",
  //       },
  //       {
  //         title: "Principios de diseño visual",
  //         href: "https://www.youtube.com/watch?v=tZy4J8YpFGI",
  //       },
  //       {
  //         title: "Wireframes y prototipos",
  //         href: "https://www.youtube.com/watch?v=8xPsg6yv7TU",
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     title: "Primeros Auxilios Básicos",
  //     category: "Salud",
  //     lessons: [
  //       {
  //         title: "Evaluación inicial del paciente",
  //         href: "https://www.youtube.com/watch?v=oqjv9CdHtqE",
  //       },
  //       {
  //         title: "RCP paso a paso",
  //         href: "https://www.youtube.com/watch?v=0PKE_kbsB40",
  //       },
  //       {
  //         title: "Atención de heridas y hemorragias",
  //         href: "https://www.youtube.com/watch?v=Q2u1P4N77kQ",
  //       },
  //     ],
  //   },
  //   {
  //     id: 4,
  //     title: "JavaScript desde cero",
  //     category: "Programación",
  //     lessons: [
  //       {
  //         title: "Variables y Tipos de Datos",
  //         href: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
  //       },
  //       {
  //         title: "Funciones y Alcance",
  //         href: "https://www.youtube.com/watch?v=hBjHldN2tYI",
  //       },
  //       {
  //         title: "DOM y Eventos",
  //         href: "https://www.youtube.com/watch?v=0ik6X4DJKCc",
  //       },
  //     ],
  //   },
  //   {
  //     id: 5,
  //     title: "Fotografía con el celular",
  //     category: "Arte",
  //     lessons: [
  //       {
  //         title: "Composición fotográfica básica",
  //         href: "https://www.youtube.com/watch?v=IhS8KQZtA2Y",
  //       },
  //       {
  //         title: "Iluminación natural y artificial",
  //         href: "https://www.youtube.com/watch?v=yqW1fW8F4GE",
  //       },
  //       {
  //         title: "Edición con apps gratuitas",
  //         href: "https://www.youtube.com/watch?v=wEw8aVd8bfk",
  //       },
  //     ],
  //   },
  // ];

  return (
    <section>
      <div className="container mx-auto flex flex-col items-center gap-7 md:gap-16 lg:px-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 text-white">
            Material Audiovisual
          </Badge>
          <Titleh1 title="Contenido multimedia" className="mb-4" />
          {courses?.length === 0 ? (
            <p className="text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
              Estamos trabajando para ofrecerte las mejores propuestas de
              formación online.
            </p>
          ) : (
            <p className="text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
              Formate en reanimación cardiopulmonar y aprendé a salvar vidas.
            </p>
          )}
        </div>

        {courses?.length === 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <CommingSoonCards
              id={1}
              title="Curso de React Básico"
              category="Desarrollo Web"
            />
            <CommingSoonCards
              id={2}
              title="Curso de CSS Avanzado"
              category="Diseño Web"
            />
            <CommingSoonCards
              id={3}
              title="Curso de JavaScript Moderno"
              category="Programación"
            />
          </div>
        )}
      </div>

      <div className="container mx-auto flex flex-col items-center gap-7 md:gap-16 lg:px-16 pt-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {courses?.map((n, i) => {
            const overlayColors = [
              "from-blue-500/40 to-blue-700/40",
              "from-green-500/40 to-green-700/40",
              "from-rose-500/40 to-rose-700/40",
              "from-amber-500/40 to-amber-700/40",
              "from-purple-500/40 to-purple-700/40",
            ];

            return (
              <Card
                key={n.id}
                className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-md hover:shadow-lg transition-all duration-300 border border-neutral-200 dark:border-neutral-800"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Link
                    href={`/capacitaciones/${n.id}`}
                    className="block group"
                  >
                    <Image
                      src="/images/2.jpeg"
                      alt={n.title}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-2xl"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-tr ${
                        overlayColors[i % overlayColors.length]
                      } opacity-40 group-hover:opacity-60 transition-opacity`}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/80 dark:bg-black/50 text-neutral-800 dark:text-neutral-200 text-xs font-semibold px-2 py-1 rounded-full">
                        {n.category}
                      </span>
                    </div>
                  </Link>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">
                    <Link
                      href={`/capacitaciones/${n.id}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {n.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {n.lessons[0].title} / {n.lessons.length}{" "}
                    {n.lessons.length > 1 ? "videos" : "video"}
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

export { CoursesSection };
