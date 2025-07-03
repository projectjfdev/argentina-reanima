"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/libs/utils";

const SUGGESTIONS = [
  "RCP",
  "Reanimación",
  "Desfibrilador",
  "Soporte vital básico",
  "Emergencias médicas",
  "Masaje cardíaco",
  "Respiración boca a boca",
  "Argentina",
  "Protocolo de emergencia",
  "Capacitación en RCP",
  "Camuzzi",
];

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ placeholder = "Buscar...", onSearch }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    const isSafari =
      ua.includes("safari") &&
      !ua.includes("chrome") &&
      !ua.includes("chromium");
    const isChromeOniOS = ua.includes("crios");
    return isSafari || isChromeOniOS;
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      const filtered = SUGGESTIONS.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
      setIsAnimating(true);
      setHasSubmitted(true);
      setTimeout(() => {
        setIsAnimating(false);
        setHasSubmitted(false);
      }, 1000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 800);
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  const suggestionVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: i * 0.05 },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: i * 0.07,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: i * 0.03 },
    }),
  };

  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0 }}
      animate={{
        x: [0, (Math.random() - 0.5) * 40],
        y: [0, (Math.random() - 0.5) * 40],
        scale: [0, Math.random() * 0.8 + 0.4],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: Math.random() * 1.5 + 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
      className="absolute w-3 h-3 rounded-full "
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: "blur(2px)",
      }}
    />
  ));

  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => (
        <motion.div
          key={`click-${i}`}
          initial={{
            x: mousePosition.x,
            y: mousePosition.y,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: mousePosition.x + (Math.random() - 0.5) * 160,
            y: mousePosition.y + (Math.random() - 0.5) * 160,
            scale: Math.random() * 0.8 + 0.2,
            opacity: [1, 0],
          }}
          transition={{ duration: Math.random() * 0.8 + 0.5, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(${Math.floor(Math.random() * 255)}, ${
              Math.floor(Math.random() * 200) + 55
            }, ${Math.floor(Math.random() * 255)}, 0.8)`,
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
          }}
        />
      ))
    : null;

  return (
    <div>
      <GooeyFilter />
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center w-full"
        initial={{ width: "240px" }}
        animate={{
          width: isFocused && !hasSubmitted ? "340px" : "240px",
          scale: isFocused && !hasSubmitted ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md",
            isFocused
              ? "border-transparent shadow-sm"
              : "border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/50"
          )}
          animate={{
            boxShadow: isFocused
              ? "0 5px 10px rgba(0, 0, 0, 0.1)"
              : "0 0 0 rgba(0, 0, 0, 0)",
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.15,
              }}
              transition={{
                duration: 15,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: "url(#gooey-effect)" }}
          >
            {particles}
            {clickParticles}
          </div>

          <motion.input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false);
                setSuggestions([]);
              }, 100);
            }}
            className={cn(
              "w-[300px] rounded-full bg-transparent py-2 pl-14 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none focus:ring-0",
              isUnsupportedBrowser ? "text-gray-700 dark:text-gray-300" : ""
            )}
            spellCheck={false}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                style={{color: "white",background: "#1A9DD9"}}
                whileHover={{
                  scale: 1.05,
                  background:
                    "#1A9DD9",
                  boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 mr-2 text-sm font-medium rounded-full bg-[#1A9DD9] text-white backdrop-blur-sm transition-all shadow-lg cursor-pointer"
              >
                Buscar
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            type="submit"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2  text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            aria-label="Buscar"
            variants={searchIconVariants}
            animate="animate"
            initial="initial"
          >
            <Search size={20} />
          </motion.button>
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.ul
            className="absolute z-20 w-full max-w-md mt-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {suggestions.map((item, i) => (
              <motion.li
                key={item}
                custom={i}
                variants={suggestionVariants}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onMouseDown={() => {
                  // Use onMouseDown to avoid losing focus before onClick
                  setSearchQuery(item);
                  setSuggestions([]);
                  inputRef.current?.blur();
                }}
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
