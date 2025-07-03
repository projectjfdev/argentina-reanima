"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

interface InstagramEmbedProps {
  url: string;
}

const InstagramEmbed = ({ url }: InstagramEmbedProps) => {
  useEffect(() => {
    const loadInstagramEmbed = () => {
      if (typeof window !== "undefined" && window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = loadInstagramEmbed;
      document.body.appendChild(script);
    } else {
      loadInstagramEmbed();
    }
  }, []);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ maxWidth: "800px", width: "100%" }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer"></a>
    </blockquote>
  );
};

export default InstagramEmbed;
