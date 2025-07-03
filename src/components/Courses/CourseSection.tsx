"use client";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useCourse } from "@/context/CourseContext";
import Link from "next/link";
import { CommingSoonCards } from "./ComingSoon";
import { Titleh1 } from "../Texts/Titleh1";

const CoursesSection = () => {
  const { courses } = useCourse();
  console.log(courses);

  return (
    <section>
      <div className="container mx-auto flex flex-col items-center gap-7 md:gap-16 lg:px-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 text-white">
            Cursos Online
          </Badge>
          <Titleh1 title="Cursos" className="mb-4" />
          <p className="text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {/* Formate en reanimación cardiopulmonar y aprendé a salvar vidas. */}
            Estamos trabajando para ofrecerte las mejores propuestas de
            formación online.
          </p>
        </div>

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
          {/* Agregá más cards hardcodeadas acá si querés */}
        </div>
      </div>

      <div className="container mx-auto flex flex-col items-center gap-7 md:gap-16 lg:px-16 pt-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {courses?.map((n) => {
            return (
              <Card key={n.id} className="grid grid-rows-[auto_auto_1fr_auto]">
                <div className="aspect-[16/9] w-full">
                  <Link
                    href={`/capacitaciones/${n.id}`}
                    className="transition-opacity duration-200 fade-in hover:opacity-70"
                  >
                    <Image
                      src="/images/curso-gratuito-thumb.jpg"
                      alt={n.title}
                      className="h-full w-full object-cover object-center"
                      width={40}
                      height={40}
                    />
                  </Link>
                </div>
                <CardContent className="p-4">
                  <CardHeader>
                    <h3 className="text-lg font-semibold hover:underline md:text-xl">
                      <Link href={`/capacitaciones/${n.id}`}>{n.title}</Link>
                    </h3>
                  </CardHeader>
                  <p className="text-muted-foreground">
                    Categoria: {n.category}
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
