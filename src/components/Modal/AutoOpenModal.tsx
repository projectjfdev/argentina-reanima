"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const AutoOpenModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Verifica si ya se mostró el modal anteriormente
  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenModal");
    if (!hasSeenModal) {
      const timeout = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("hasSeenModal", "true");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-2xl rounded-2xl bg-white shadow-xl p-0 overflow-hidden h-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-full h-60 relative">
            <Image
              src="/images/banner-congreso.jpg"
              alt="Congreso Nacional de RCP"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-6">
            <DialogTitle className="text-xl font-bold mb-3">
              Congreso Nacional de RCP
            </DialogTitle>
            <p className="text-sm text-gray-700 mb-4">
              Te invitamos a participar del primer Congreso Nacional de RCP. ¡No
              te lo pierdas!
            </p>
            <Link
              href="https://www.congresonacionalrcp.com.ar/"
              className="inline-block bg-[#1d3a1e] hover:bg-primary text-white px-4 py-2 rounded-md text-sm transition-colors"
              target="_blank"
            >
              Más información
            </Link>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoOpenModal;
