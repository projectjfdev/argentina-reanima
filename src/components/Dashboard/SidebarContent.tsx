import {
  LayoutDashboard,
  LogOut,
  Newspaper,
  School,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./Sidebar";
import { cn } from "@/libs/utils";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Panel administrativo",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Noticias",
      href: "/dashboard/noticias",
      icon: (
        <Newspaper className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Cursos",
      href: "/dashboard/cursos",
      icon: (
        <School className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        " rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "min-h-[60vh] my-5 mt-30 py-5" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div onClick={() => signOut()}>
            <SidebarLink
              link={{
                label: "Cerrar sesión",
                href: "#",
                icon: <LogOut className="h-5 w-5 flex-shrink-0" />,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        width={20}
        height={20}
        src="/logo/logo.png"
        alt="argentinareanima"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Argentina Reanima
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20 group"
    >
      <Image
        width={20}
        height={20}
        src="/logo/logo.png"
        alt="argentinareanima"
        className="filter grayscale contrast-150 transition duration-300 group-hover:grayscale-0"
      />
    </Link>
  );
};
