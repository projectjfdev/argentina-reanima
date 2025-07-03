"use client";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Titleh1 } from "../Texts/Titleh1";
import { motion } from "framer-motion";

function TextImage() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full"
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <div className="flex gap-4 flex-col items-start">
              <Titleh1
                title="Tu compromiso es necesario"
                className="max-w-lg tracking-tighter text-start font-regular"
              />

              <p className="text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
                Aprendé los pasos clave para actuar ante una situación de muerte
                súbita. Con nuestras capacitaciones, dictadas por instructores
                certificados, podes estar preparado para intervenir de manera
                segura y eficaz cuando más se necesita; porque cada segundo
                cuenta.
              </p>
            </div>
            <div className="flex flex-row gap-4 py-4">
              <Button
                size="lg"
                className="gap-4 cursor-pointer"
                variant="outline"
                onClick={() => router.push("/capacitaciones")}
              >
                Ver cursos <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="grid grid-cols-2 gap-8"
          >
            <div className="w-auto bg-[url('/images/1.jpeg')] bg-center bg-cover bg-no-repeat bg-muted rounded-md aspect-square"></div>
            <div className="bg-[url('/images/6.jpeg')] bg-contain bg-muted rounded-md row-span-2 md:bg-[center_24%]"></div>
            <div className="bg-[url('/images/3.jpeg')] bg-center bg-cover bg-no-repeat bg-muted rounded-md aspect-square"></div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export { TextImage };
