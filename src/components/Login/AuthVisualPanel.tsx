"use client";

import { DotMap } from "@/components/Login/DotMap";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface AuthVisualPanelProps {
  description: string;
}

export function AuthVisualPanel({ description }: AuthVisualPanelProps) {
  return (
    <div className="hidden md:block w-1/2 min-h-[600px] self-stretch relative overflow-hidden border-r border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
        <DotMap />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-6"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <ArrowRight className="text-white h-6 w-6" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600"
          >
            Argentina Reanima
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-sm text-center text-gray-600 max-w-xs"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
