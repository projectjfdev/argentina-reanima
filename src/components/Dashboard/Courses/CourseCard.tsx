"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PenIcon, Trash, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCourse } from "@/context/CourseContext";
import type { ICourse } from "@/interfaces/courses";
import { Badge } from "@/components/ui/badge";

const CourseCard = ({ n }: { n: ICourse }) => {
  const { deleteCourse, setSelectedCourse } = useCourse();

  // Format date to a readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AccordionItem value={n.id.toString()} key={n.id} className="py-2">
      <AccordionTrigger className="flex flex-1 items-center justify-between py-2 text-left text-lg font-semibold">
        <div className="flex items-center gap-3">
          {n.title}
          <Badge variant="outline" className="ml-2">
            {n.category}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-4 pb-2 text-muted-foreground">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-medium text-foreground">{n.title}</h3>
              <p className="text-sm text-muted-foreground">
                Categoría: <span className="font-medium">{n.category}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Creado: {formatDate(n.createdAt)} | Actualizado:{" "}
                {formatDate(n.updatedAt)}
              </p>
            </div>

            {n.lessons && n.lessons.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">
                  Lecciones ({n.lessons.length})
                </h4>
                <ul className="space-y-2">
                  {n.lessons.map((lesson, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                    >
                      <span className="text-sm">{lesson.title}</span>
                      <a
                        href={lesson.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver lección
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label="Eliminar curso"
                  onClick={async () => {
                    if (
                      confirm("¿Estás seguro que queres eliminar este curso?")
                    ) {
                      await deleteCourse(n.id);
                    }
                  }}
                >
                  <Trash className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">
                <p>Eliminar curso</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label="Editar curso"
                  onClick={() => setSelectedCourse(n)}
                >
                  <PenIcon className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar curso</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CourseCard;
