"use client";

import { InView } from "./InView";
import { motion } from "framer-motion";
import Image from "next/image";

interface GalleryScrollProps {
  images: string[];
}

function GalleryScroll({ images }: GalleryScrollProps) {
  return (
    <div className="h-[80vh] w-full overflow-y-auto overflow-x-hidden">
      <div className="flex  items-end justify-center pb-12">
        <InView
          viewOptions={{ once: true, margin: "0px 0px -250px 0px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.09 },
            },
          }}
        >
          <div className="columns-2 gap-4 px-8 sm:columns-3">
            {images.map((imgSrc, index) => (
              <motion.div
                variants={{
                  hidden: {
                    opacity: 0,
                    scale: 0.8,
                    filter: "blur(10px)",
                  },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  },
                }}
                key={index}
                className="mb-4"
              >
                <Image
                  src={imgSrc}
                  alt={`Image from gallery index:${index}`}
                  className="size-full rounded-lg object-contain h-full"
                  width={100}
                  height={100}
                  style={{ objectFit: "contain" }}
                />
              </motion.div>
            ))}
          </div>
        </InView>
      </div>
    </div>
  );
}

export default GalleryScroll;
