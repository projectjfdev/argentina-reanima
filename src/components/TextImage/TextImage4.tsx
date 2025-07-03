"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Titleh1 } from "../Texts/Titleh1";
import { User, Users, Video } from "lucide-react";
import { useRouter } from "next/navigation";

interface TextStyle {
  color?: string;
  fontSize?: string;
  gradient?: string;
}
interface ButtonStyle {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  hoverColor?: string;
  hoverForeground?: string; // NEW: color of text on hover
}
interface SlideContent {
  title: string;
  image: string;
}
interface DicedHeroSectionProps {
  mainText: string;
  subMainText: string;
  buttonText: string;
  slides: SlideContent[];
  onMainButtonClick?: () => void;
  onGridImageHover?: (index: number) => void;
  onGridImageClick?: (index: number) => void;
  mainTextStyle?: TextStyle;
  subMainTextStyle?: TextStyle;
  buttonStyle?: ButtonStyle;
  componentBorderRadius?: string;
  backgroundColor?: string;
  separatorColor?: string;
  maxContentWidth?: string;
  mobileBreakpoint?: number;
  fontFamily?: string;
  isRTL?: boolean;
}

export const DicedHeroSection: React.FC<DicedHeroSectionProps> = ({
  mainText,
  subMainText,
  slides,
  onGridImageHover,
  onGridImageClick,
  mainTextStyle,
  subMainTextStyle,
  componentBorderRadius = "0px",
  backgroundColor,
  separatorColor = "#005baa",
  maxContentWidth = "1536px",
  mobileBreakpoint = 1000,
  fontFamily = "inherit",
  isRTL = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isRTLCheck = (text: string): boolean => {
    return /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/.test(text);
  };

  useEffect(() => {
    const checkMobile = () => {
      if (containerRef.current) {
        setIsMobile(containerRef.current.offsetWidth < mobileBreakpoint);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mobileBreakpoint]);

  const getGradientStyle = (gradient?: string) => {
    if (gradient) {
      return {
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
      };
    }
    return {};
  };

  return (
    <main
      ref={containerRef}
      style={{
        borderRadius: componentBorderRadius,
        backgroundColor,
        padding: "2rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: isMobile ? "column" : isRTL ? "row-reverse" : "row",
        justifyContent: "center",
        alignItems: "stretch",
        width: "100%",
        maxWidth: maxContentWidth,
        margin: "0 auto",
        minHeight: "auto",
        height: "auto",
        fontFamily,
        position: "relative",
      }}
    >
      <div
        style={{
          flex: 1,
          marginRight: isMobile ? 0 : isRTL ? 0 : "2rem",
          marginLeft: isMobile ? 0 : isRTL ? "2rem" : 0,
          textAlign: isMobile ? "center" : isRTL ? "right" : "left",
          alignItems: isMobile ? "center" : isRTL ? "flex-end" : "flex-start",
          maxWidth: isMobile ? "100%" : "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 1,
          paddingBottom: isMobile ? "2rem" : 0,
        }}
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              ...mainTextStyle,
              direction: isRTLCheck(mainText) ? "rtl" : "ltr",
              textAlign: isMobile
                ? "center"
                : isRTLCheck(mainText)
                ? "right"
                : "left",
              fontSize: mainTextStyle?.fontSize,
            }}
          >
            <motion.span className="flex justify-start">
              <Titleh1 title="Tu compromiso es necesario" />
            </motion.span>
          </motion.div>
          <motion.hr
            initial={{ width: 0 }}
            animate={{ width: "6.25rem" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              height: "0.25rem",
              background: separatorColor,
              border: "none",
              margin: isMobile
                ? "1.125rem auto 1.875rem"
                : isRTLCheck(mainText)
                ? "1.125rem 0 1.875rem auto"
                : "1.125rem 0 1.875rem",
              alignSelf: isMobile
                ? "center"
                : isRTLCheck(mainText)
                ? "flex-end"
                : "flex-start",
            }}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              ...subMainTextStyle,
              ...getGradientStyle(subMainTextStyle?.gradient),
              direction: isRTLCheck(subMainText) ? "rtl" : "ltr",
              textAlign: isRTLCheck(subMainText) ? "right" : "left",
            }}
          >
            {subMainText}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: isMobile
              ? "center"
              : isRTL
              ? "flex-end"
              : "flex-start",
          }}
        >
          <Button
            size="lg"
            className="gap-4 cursor-pointer"
            // variant="outline"
            onClick={() => router.push("/quienes-somos")}
          >
            Nuestra historia <Users className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: isRTL ? "flex-start" : "flex-end",
          position: "relative",
          width: isMobile ? "100%" : "50%",
          paddingLeft: isMobile ? 0 : isRTL ? 0 : "2rem",
          paddingRight: isMobile ? 0 : isRTL ? "2rem" : 0,
          height: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            width: "100%",
            aspectRatio: "1 / 1",
          }}
        >
          {[slides[3], slides[2], slides[1], slides[0]].map((slide, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
                overflow: "hidden",
                borderRadius: "20px",
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`warped-image ${
                  ["bottom-right", "bottom-left", "top-right", "top-left"][
                    index
                  ]
                }`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onClick={() => onGridImageClick && onGridImageClick(index)}
                onMouseEnter={() => onGridImageHover && onGridImageHover(index)}
              />
            </div>
          ))}
        </div>
      </div>
      {!isMobile && (
        <style jsx global>{`
          .warped-image {
            --r: 20px;
            --s: 40px;
            --x: 25px;
            --y: 5px;
          }
          .top-right {
            --_m: /calc(2 * var(--r)) calc(2 * var(--r)) radial-gradient(#000
                  70%, #0000 72%);
            --_g: conic-gradient(
              at calc(100% - var(--r)) var(--r),
              #0000 25%,
              #000 0
            );
            --_d: (var(--s) + var(--r));
            mask: calc(100% - var(--_d) - var(--x)) 0 var(--_m),
              100% calc(var(--_d) + var(--y)) var(--_m),
              radial-gradient(
                  var(--s) at 100% 0,
                  #0000 99%,
                  #000 calc(100% + 1px)
                )
                calc(-1 * var(--r) - var(--x)) calc(var(--r) + var(--y)),
              var(--_g) calc(-1 * var(--_d) - var(--x)) 0,
              var(--_g) 0 calc(var(--_d) + var(--y));
            mask-repeat: no-repeat;
          }
          .top-left {
            --_m: /calc(2 * var(--r)) calc(2 * var(--r)) radial-gradient(#000
                  70%, #0000 72%);
            --_g: conic-gradient(at var(--r) var(--r), #000 75%, #0000 0);
            --_d: (var(--s) + var(--r));
            mask: calc(var(--_d) + var(--x)) 0 var(--_m),
              0 calc(var(--_d) + var(--y)) var(--_m),
              radial-gradient(var(--s) at 0 0, #0000 99%, #000 calc(100% + 1px))
                calc(var(--r) + var(--x)) calc(var(--r) + var(--y)),
              var(--_g) calc(var(--_d) + var(--x)) 0,
              var(--_g) 0 calc(var(--_d) + var(--y));
            mask-repeat: no-repeat;
          }
          .bottom-left {
            --_m: /calc(2 * var(--r)) calc(2 * var(--r)) radial-gradient(#000
                  70%, #0000 72%);
            --_g: conic-gradient(
              from 180deg at var(--r) calc(100% - var(--r)),
              #0000 25%,
              #000 0
            );
            --_d: (var(--s) + var(--r));
            mask: calc(var(--_d) + var(--x)) 100% var(--_m),
              0 calc(100% - var(--_d) - var(--y)) var(--_m),
              radial-gradient(
                  var(--s) at 0 100%,
                  #0000 99%,
                  #000 calc(100% + 1px)
                )
                calc(var(--r) + var(--x)) calc(-1 * var(--r) - var(--y)),
              var(--_g) calc(var(--_d) + var(--x)) 0,
              var(--_g) 0 calc(-1 * var(--_d) - var(--y));
            mask-repeat: no-repeat;
          }
          .bottom-right {
            --_m: /calc(2 * var(--r)) calc(2 * var(--r)) radial-gradient(#000
                  70%, #0000 72%);
            --_g: conic-gradient(
              from 90deg at calc(100% - var(--r)) calc(100% - var(--r)),
              #0000 25%,
              #000 0
            );
            --_d: (var(--s) + var(--r));
            mask: calc(100% - var(--_d) - var(--x)) 100% var(--_m),
              100% calc(100% - var(--_d) - var(--y)) var(--_m),
              radial-gradient(
                  var(--s) at 100% 100%,
                  #0000 99%,
                  #000 calc(100% + 1px)
                )
                calc(-1 * var(--r) - var(--x)) calc(-1 * var(--r) - var(--y)),
              var(--_g) calc(-1 * var(--_d) - var(--x)) 0,
              var(--_g) 0 calc(-1 * var(--_d) - var(--y));
            mask-repeat: no-repeat;
          }
        `}</style>
      )}
    </main>
  );
};
