"use client";

import { useMobile } from "@/hooks/useMedia";

export default function PDFViewer() {
  const isMobile = useMobile();

  return (
    <div className="md:relative md:max-w-2xl md:mx-auto text-center mt-10">
      {isMobile ? (
        <a
          href="/post-ig.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          ¿Conocés la ley muerte súbita. Sistema de prevención integral? Ver PDF
        </a>
      ) : (
        <iframe
          className="w-full md:w-[500px]"
          src="/post-ig.pdf"
          height="800px"
          style={{ border: "none" }}
        ></iframe>
      )}
    </div>
  );
}
