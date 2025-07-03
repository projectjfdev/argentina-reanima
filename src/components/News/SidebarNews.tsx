"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftFromLine, ArrowRightFromLine, Newspaper } from "lucide-react";
// import Image from "next/image";
import Link from "next/link";

const CollapsibleSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        className="w-full flex items-center justify-between py-2 px-4 rounded-xl hover:bg-gray-100"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold">{title}</span>
        {open ? <XIcon /> : <MenuIcon />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuIcon = () => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <motion.line x1="3" y1="12" x2="21" y2="12" />
  </motion.svg>
);

const XIcon = () => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <motion.line x1="18" y1="6" x2="6" y2="18" />
    <motion.line x1="6" y1="6" x2="18" y2="18" />
  </motion.svg>
);

const SidebarNews = ({
  setCategory,
}: {
  setCategory: (category: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false); // visible o hidden
  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  // const logo = {
  //   url: "/",
  //   src: "/logo/logo.png",
  //   alt: "argentinareanima",
  // };

  return (
    <div className="flex  h-[500px]  bg-gray-300">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        <motion.div
          initial="hidden"
          animate={showMenu ? "visible" : "hidden"}
          exit="hidden"
          variants={mobileSidebarVariants}
          transition={{ duration: 0.3 }}
          className="md:hidden fixed inset-0 z-50 bg-white text-black "
        >
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="md:hidden fixed top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-50 bg-white shadow-lg border rounded-full p-3 hover:bg-gray-100 transition"
          >
            {!showMenu ? (
              <ArrowRightFromLine className="ml-2 w-5 h-5 text-black" />
            ) : (
              <ArrowLeftFromLine className="mr-2 w-5 h-5 text-black" />
            )}
          </button>
          <div className="flex flex-col h-full ">
            {/* Profile Section */}
            <div className="p-4 border-b border-gray-200 ">
              <div className="flex items-center space-x-3">
                {/* <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Image
                    width={200}
                    height={200}
                    src={logo.src}
                    className="img-logo transform transition-transform duration-300 hover:scale-105 w-6 h-6 cursro-pointer"
                    alt={logo.alt}
                  />
                </div> */}
                <div>
                  <p className="font-semibold">Menú de noticias</p>
                  <p className="text-sm text-gray-500">
                    argentinareanima.ac@gmail.com
                  </p>
                </div>
              </div>
            </div>
            {/* Navigation Section */}
            <nav className="flex-1 p-4 overflow-y-auto   ">
              <ul>
                <li className="mb-2">
                  <button className="flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-xl hover:bg-gray-100">
                    <Newspaper className="h-5 w-5" />
                    Noticias
                  </button>
                </li>
              </ul>
              {/* Toggleable Sections */}
              <div className="mt-4">
                <CollapsibleSection title="Categorías">
                  <ul>
                    <li>
                      <button
                        className="w-full font-medium text-sm text-left p-2 rounded-xl hover:bg-gray-100"
                        onClick={() => setCategory("Medios")}
                      >
                        Medios
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full font-medium text-sm text-left p-2 rounded-xl hover:bg-gray-100"
                        onClick={() => setCategory("Alianza con Camuzzi Gas")}
                      >
                        Alianza con Camuzzi Gas
                      </button>
                    </li>
                  </ul>
                </CollapsibleSection>
                <CollapsibleSection title="Más información">
                  <div>
                    <li className="text-base pl-2 text-gray-500 hover:text-gray-400">
                      <Link
                        href={
                          "https://www.youtube.com/channel/UCUe7YAlQawPP9VHg_1B172w"
                        }
                        target="_blank"
                      >
                        Youtube
                      </Link>
                    </li>
                    <li className="text-base pl-2 text-gray-500 hover:text-gray-400">
                      <Link
                        href={
                          "https://www.facebook.com/profile.php?id=100087258240312"
                        }
                        target="_blank"
                      >
                        Facebook
                      </Link>
                    </li>
                    <li className="text-base pl-2 text-gray-500 hover:text-gray-400">
                      <Link
                        href={"https://www.instagram.com/argentinareanimaac"}
                        target="_blank"
                      >
                        Instagram
                      </Link>
                    </li>
                  </div>
                </CollapsibleSection>
              </div>
            </nav>
            {/* Footer / Action Button */}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full w-64 bg-gray-50 text-black shadow ">
        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {/* <div className="w-12 h-12  rounded-full flex items-center justify-center">
              <Image
                width={200}
                height={200}
                src={logo.src}
                className="img-logo transform transition-transform duration-300 hover:scale-105 w-6 h-6 cursro-pointer"
                alt={logo.alt}
              />
            </div> */}
            <div>
              <p className="font-semibold">Menú de noticias</p>
              <p className="text-sm text-gray-500">
                argentinareanima.ac@gmail.com
              </p>
            </div>
          </div>
        </div>
        {/* Navigation Section */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul>
            <li className="mb-2">
              <button className="flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-xl hover:bg-gray-100">
                <Newspaper className="h-5 w-5" />
                Noticias
              </button>
            </li>
          </ul>
          {/* Toggleable Sections */}
          <div className="mt-4 ">
            <CollapsibleSection title="Categorias">
              <ul>
                <li>
                  <button
                    className="w-full font-medium text-sm text-left p-2 rounded-xl hover:bg-gray-100"
                    onClick={() => setCategory("Medios")}
                  >
                    Medios
                  </button>
                </li>
                <li>
                  <button
                    className="w-full font-medium text-sm text-left p-2 rounded-xl hover:bg-gray-100"
                    onClick={() => setCategory("Alianza con Camuzzi Gas")}
                  >
                    Alianza con Camuzzi Gas
                  </button>
                </li>
              </ul>
            </CollapsibleSection>
            <CollapsibleSection title="Más Información">
              <div>
                <li className="text-base pl-2 text-gray-500 hover:text-gray-400">
                  <Link
                    href={
                      "https://www.youtube.com/channel/UCUe7YAlQawPP9VHg_1B172w"
                    }
                    target="_blank"
                  >
                    Youtube
                  </Link>
                </li>
                <li className="text-base pl-2 text-gray-500 hover:text-gray-400">
                  <Link
                    href={
                      "https://www.facebook.com/profile.php?id=100087258240312"
                    }
                    target="_blank"
                  >
                    Facebook
                  </Link>
                </li>
                <li className="text-base pl-2 text-gray-500 hover:text-gray-400">
                  <Link
                    href={"https://www.instagram.com/argentinareanimaac"}
                    target="_blank"
                  >
                    Instagram
                  </Link>
                </li>
              </div>
            </CollapsibleSection>
          </div>
        </nav>
      </div>
    </div>
  );
};

export { SidebarNews };
