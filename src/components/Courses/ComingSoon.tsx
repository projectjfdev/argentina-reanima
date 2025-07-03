"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CommingSoonCardsrops {
  id: number;
  title: string;
  category: string;
  imageUrl?: string;
}

export function CommingSoonCards({
  id,
  title,
  category,
  imageUrl = "/images/curso-gratuito-thumb.jpg",
}: CommingSoonCardsrops) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="grid grid-rows-[auto_auto_1fr_auto] relative overflow-hidden">
      {/* Blurred content */}
      <div className="filter blur-[6px] pointer-events-none">
        <div className="aspect-[16/9] w-full">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover object-center"
            width={400}
            height={225}
          />
        </div>
        <CardContent className="p-4">
          <CardHeader>
            <h3 className="text-lg font-semibold md:text-xl">{title}</h3>
          </CardHeader>
          <p className="text-muted-foreground">Categoria: {category}</p>
        </CardContent>
      </div>

      {/* Overlay with "Próximamente" */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.2,
          }}
          className="text-center"
        >
          <motion.div
            className="bg-primary px-6 py-3 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.h2
              className="text-white font-bold md:text-xl xl:text-3xl"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >
              PRÓXIMAMENTE
            </motion.h2>
          </motion.div>
          <motion.p
            className="text-white mt-3 text-sm md:text-base"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
          >
            Estamos preparando este contenido para vos
          </motion.p>
        </motion.div>
      </div>
    </Card>
  );
}
