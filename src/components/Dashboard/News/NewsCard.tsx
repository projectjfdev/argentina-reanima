import { useNews } from "@/context/NewsContext";
import React from "react";
import { News } from "@/generated/prisma";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PenIcon, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

const NewsCard = ({ n }: { n: News }) => {
  const { deleteNews, setSelectedNews } = useNews();

  return (
    <AccordionItem value={n.id.toString()} key={n.id} className="py-2">
      <AccordionTrigger className="flex flex-1 items-center justify-between py-2 text-left text-lg font-semibold">
        {n.title}
      </AccordionTrigger>

      <AccordionContent className="pt-4 pb-2 text-muted-foreground">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-medium text-foreground">{n.title}</h3>
            <p className="text-sm text-muted-foreground">{n.description}</p>
            <p className="text-sm text-muted-foreground">
              {" "}
              Fecha:{" "}
              {n?.dateNew
                ? new Date(n.dateNew).toLocaleDateString()
                : "Sin fecha"}
            </p>
          </div>

          <div className="w-full md:w-auto">
            {n.imageUrl ? (
              <Image
                className="rounded-md border border-gray-200 object-cover max-w-xs"
                src={n.imageUrl}
                alt={n.title}
                width={250}
                height={250}
              />
            ) : (
              <Image
                src={"/images/noticia-generica.jpg"}
                alt="Imagen seleccionada"
                className="mx-auto mb-4 max-h-60 object-contain rounded-md"
                width={200}
                height={200}
              />
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
                  aria-label="Eliminar noticia"
                  onClick={async () => {
                    if (
                      confirm("¿Estás seguro que queres eliminar esta noticia?")
                    ) {
                      await deleteNews(n.id);
                    }
                  }}
                >
                  <Trash className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">
                <p>Eliminar noticia</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label="Editar noticia"
                  onClick={() => setSelectedNews(n)}
                >
                  <PenIcon className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar noticia</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default NewsCard;
