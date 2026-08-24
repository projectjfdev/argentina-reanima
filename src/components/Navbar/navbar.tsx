"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Globe,
  Headset,
  Heart,
  HeartHandshake,
  Home,
  Images,
  LogIn,
  Menu,
  Music,
  Network,
  NewspaperIcon,
  Pen,
  Scale,
  School,
  Smile,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

interface MenuLink {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

interface MenuGroup {
  label: string;
  links: MenuLink[];
  highlighted?: boolean;
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
  };
}

const mainLinks: MenuLink[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Actividades", href: "/actividades", icon: ActivityIcon },
  { label: "Noticias", href: "/noticias", icon: NewspaperIcon },
  { label: "Contacto", href: "/contacto", icon: Headset },
];

const resourcesLinks: MenuLink[] = [
  {
    label: "Marco normativo",
    href: "/marco-normativo",
    icon: Scale,
    description: "Leyes y referencias institucionales.",
  },
  {
    label: "Videos",
    href: "/capacitaciones",
    icon: Pen,
    description: "Capacitaciones y material audiovisual.",
  },
  {
    label: "RCP y cuidado emocional",
    href: "/rcp-y-cuidado-emocional",
    icon: Smile,
    description: "Protocolo de intervención y cuidado emocional.",
  },
  {
    label: "Nuestra música",
    href: "/nuestra-musica",
    icon: Music,
    description: "Canciones y materiales de la organización.",
  },
  {
    label: "Galería de imágenes",
    href: "/galeria",
    icon: Images,
    description: "Actividades, cursos y encuentros en imágenes.",
  },
  {
    label: "Redes sociales",
    href: "/redes-sociales",
    icon: Network,
    description: "Contenido organizado por categorías.",
  },
];

const aboutLinks: MenuLink[] = [
  {
    label: "Quiénes somos",
    href: "/quienes-somos",
    icon: Users,
    description: "Misión, visión y valores de la organización.",
  },
  {
    label: "Filiales y convenios",
    href: "/filiales",
    icon: Globe,
    description: "Sedes regionales, capacitaciones y convenios.",
  },
];

const donationLinks: MenuLink[] = [
  {
    label: "Quiero ser parte",
    href: "/quiero-ser-parte",
    icon: Heart,
    description: "de una nueva oportunidad.",
  },
  {
    label: "Campañas de donación",
    href: "/campanas-dea",
    icon: School,
    description: "Ver todas las campañas para un DEA.",
  },
];

const navGroups: MenuGroup[] = [
  { label: "Recursos", links: resourcesLinks },
  { label: "Nosotros", links: aboutLinks },
  { label: "Campañas", links: donationLinks, highlighted: true },
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
  const { data: session, status } = useSession();
  const isSessionLoading = status === "loading";

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
            className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <DesktopNavLink href="/">Inicio</DesktopNavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <DesktopNavLink href="/actividades">
                    Actividades
                  </DesktopNavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <DesktopDropdown group={navGroups[0]} />
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <DesktopNavLink href="/noticias">Noticias</DesktopNavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <DesktopDropdown group={navGroups[1]} />
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <DesktopNavLink href="/contacto">Contacto</DesktopNavLink>
                </NavigationMenuItem>
                {/*<NavigationMenuItem>
                  <DesktopDropdown group={navGroups[2]} />
                </NavigationMenuItem>} */}
              </NavigationMenuList>
            </NavigationMenu>

            <ProfileMenu session={session} isLoading={isSessionLoading} />
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

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-md border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
                  aria-label="Abrir menú"
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
                  <MobileGroup title="Menú principal">
                    {mainLinks.map((item) => (
                      <MobileNavLink key={item.href} item={item} />
                    ))}
                  </MobileGroup>

                  <Accordion type="multiple" className="mt-5 grid gap-2">
                    {navGroups.map((group) => (
                      <MobileAccordionGroup key={group.label} group={group} />
                    ))}
                  </Accordion>
                </div>
              </SheetContent>
            </Sheet>
            <ProfileMenu session={session} isLoading={isSessionLoading} />
          </div>
        </div>
      </div>
      {/* <Suspense fallback={null}>
        <HomeDonationBanner />
      </Suspense> */}
    </header>
  );
};

// const HomeDonationBanner = () => {
//   const pathname = usePathname();

//   if (pathname !== "/") return null;

//   return <DonationBanner />;
// };

const DesktopDropdown = ({ group }: { group: MenuGroup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = `${group.label.toLowerCase()}-desktop-menu`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={
          group.highlighted
            ? "inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            : "inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        }
        aria-controls={menuId}
        aria-expanded={isOpen}
      >
        {group.highlighted && <HeartHandshake className="mr-2 h-4 w-4" />}
        {group.label}
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
            group.highlighted ? "text-primary-foreground/80" : "text-slate-400"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={menuId}
        className={`absolute right-0 top-full z-50 mt-3 w-[340px] origin-top-right rounded-lg border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 transition-[opacity,transform,visibility] duration-150 ease-out ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <ul className="grid gap-1">
          {group.links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex gap-3 rounded-md p-3 outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary"
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
  );
};

const ProfileMenu = ({
  session,
  isLoading,
}: {
  session: Session | null;
  isLoading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = session?.user?.name || session?.user?.email || "Usuario";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div
        className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-slate-100"
        aria-hidden="true"
      />
    );
  }

  if (!session) {
    return (
      <Button
        asChild
        className="h-10 shrink-0 px-3 text-sm md:px-4"
        aria-label="Iniciar sesión"
      >
        <Link href="/auth/login">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Iniciar sesión</span>
        </Link>
      </Button>
    );
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-[box-shadow,transform] duration-150 ease-out hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Abrir menú de perfil"
        aria-expanded={isOpen}
      >
        {initial}
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-3 w-44 origin-top-right rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 transition-[opacity,transform,visibility] duration-150 ease-out ${
          isOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        <Link
          href="/mi-perfil"
          onClick={() => setIsOpen(false)}
          className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Mi Perfil
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
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

const MobileAccordionGroup = ({ group }: { group: MenuGroup }) => (
  <AccordionItem
    value={group.label}
    className="rounded-md border border-slate-200 px-2"
  >
    <AccordionTrigger
      className={`px-2 py-3 text-base font-semibold no-underline hover:no-underline ${
        group.highlighted ? "text-primary" : "text-slate-950"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {group.highlighted && <HeartHandshake className="h-4 w-4" />}
        {group.label}
      </span>
    </AccordionTrigger>
    <AccordionContent className="grid gap-1 pb-3">
      {group.links.map((item) => (
        <MobileNavLink key={item.href} item={item} compact />
      ))}
    </AccordionContent>
  </AccordionItem>
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
