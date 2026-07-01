"use client";

import { Button } from "@/components/ui/button";
import { DonationBanner } from "@/components/DonationBanner/DonationBanner";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ActivityIcon,
  ChevronDown,
  Headset,
  HeartHandshake,
  HeartPulse,
  Home,
  Images,
  Menu,
  Music,
  Network,
  NewspaperIcon,
  Pen,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

interface MenuLink {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
  };
}

const primaryLinks: MenuLink[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Noticias", href: "/noticias", icon: NewspaperIcon },
  { label: "Marco Normativo", href: "/marco-normativo", icon: Scale },
  { label: "Actividades", href: "/actividades", icon: ActivityIcon },
  { label: "Videos", href: "/capacitaciones", icon: Pen },
];

const moreLinks: MenuLink[] = [
  {
    label: "La RCP y el cuidado emocional",
    href: "/rcp-y-cuidado-emocional",
    icon: HeartHandshake,
    description: "Protocolo de intervencion y cuidado emocional.",
  },
  {
    label: "Filiales y convenios",
    href: "/filiales",
    icon: HeartPulse,
    description: "Sedes regionales, capacitaciones y convenios.",
  },
  {
    label: "Nuestra musica",
    href: "/nuestra-musica",
    icon: Music,
    description: "Canciones y materiales de la organizacion.",
  },
  {
    label: "Galeria de imagenes",
    href: "/galeria",
    icon: Images,
    description: "Actividades, cursos y encuentros en imagenes.",
  },
  {
    label: "Redes Sociales",
    href: "/redes-sociales",
    icon: Network,
    description: "Contenido organizado por categorias.",
  },
];

const secondaryLinks: MenuLink[] = [
  { label: "Quienes somos?", href: "/quienes-somos", icon: Users },
  { label: "Contacto", href: "/contacto", icon: Headset },
];

const Navbar = ({
  logo = {
    url: "/",
    src: "/logo/logo.png",
    alt: "argentinareanima",
  },
}: NavbarProps) => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(!(currentScrollY > lastScrollY && currentScrollY > 50));
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/94 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto w-full px-4 md:px-6 lg:px-10">
        <nav className="hidden h-20 items-center justify-between lg:flex">
          <Link
            href={logo.url}
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Argentina Reanima - inicio"
          >
            <Image
              width={96}
              height={96}
              src={logo.src}
              className="h-16 w-16 object-contain transition-transform duration-200 hover:scale-[1.03]"
              alt={logo.alt}
              priority
            />
          </Link>

          <div className="flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {primaryLinks.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <DesktopNavLink href={item.href}>{item.label}</DesktopNavLink>
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem className="relative">
                  <div className="group/more">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Más
                      <ChevronDown className="ml-2 h-4 w-4 text-slate-400 transition-transform duration-200 group-hover/more:rotate-180" />
                    </button>
                    <div className="invisible absolute left-0 top-full z-50 pt-3 opacity-0 transition duration-150 group-hover/more:visible group-hover/more:opacity-100 group-focus-within/more:visible group-focus-within/more:opacity-100">
                      <ul className="grid w-[360px] gap-1 rounded-lg border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10">
                      {moreLinks.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex gap-3 rounded-md p-3 outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                          >
                            <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                            <span>
                              <span className="block text-sm font-semibold text-slate-950">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="mt-1 block text-sm leading-5 text-slate-500">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                      </ul>
                    </div>
                  </div>
                </NavigationMenuItem>

                {secondaryLinks.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <DesktopNavLink href={item.href}>{item.label}</DesktopNavLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </nav>

        <div className="flex h-16 items-center justify-between lg:hidden">
          <Link
            href={logo.url}
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Argentina Reanima - inicio"
          >
            <Image
              width={72}
              height={72}
              src={logo.src}
              className="h-12 w-12 object-contain"
              alt={logo.alt}
              priority
            />
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-md border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[min(92vw,420px)] overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-md">
              <SheetHeader className="border-b border-slate-200 px-5 py-5 text-left">
                <SheetTitle>
                  <SheetClose asChild>
                    <Link href={logo.url} className="flex items-center gap-3">
                      <Image
                        width={72}
                        height={72}
                        src={logo.src}
                        className="h-12 w-12 object-contain"
                        alt={logo.alt}
                      />
                      <span className="text-base font-semibold text-slate-950">
                        Argentina Reanima
                      </span>
                    </Link>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>

              <div className="px-4 py-5">
                <MobileGroup title="Navegacion principal">
                  {primaryLinks.map((item) => (
                    <MobileNavLink key={item.href} item={item} />
                  ))}
                </MobileGroup>

                <MobileGroup title="Mas secciones" className="mt-6">
                  {moreLinks.map((item) => (
                    <MobileNavLink key={item.href} item={item} compact />
                  ))}
                </MobileGroup>

                <MobileGroup title="Institucional" className="mt-6">
                  {secondaryLinks.map((item) => (
                    <MobileNavLink key={item.href} item={item} />
                  ))}
                </MobileGroup>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <DonationBanner />
    </header>
  );
};

const DesktopNavLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="relative inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-slate-600 transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 hover:bg-slate-100 hover:text-slate-950 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  >
    {children}
  </Link>
);

const MobileGroup = ({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) => (
  <section className={className}>
    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {title}
    </p>
    <div className="grid gap-1">{children}</div>
  </section>
);

const MobileNavLink = ({
  item,
  compact = false,
}: {
  item: MenuLink;
  compact?: boolean;
}) => (
  <SheetClose asChild>
    <Link
      href={item.href}
      className="group flex min-h-12 items-center gap-3 rounded-md px-3 py-3 text-slate-800 transition-colors hover:bg-primary/10 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <item.icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-semibold leading-5">
          {item.label}
        </span>
        {!compact && item.description && (
          <span className="mt-1 block text-sm leading-5 text-slate-500">
            {item.description}
          </span>
        )}
      </span>
    </Link>
  </SheetClose>
);

export { Navbar };
