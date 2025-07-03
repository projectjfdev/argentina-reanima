"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import Link from "next/link";

const logo = {
  url: "https://www.argentinareanima.com",
  src: "/logo/logo.png",
  alt: "argentinareanima",
};

function Footer() {
  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Image
              width={200}
              height={200}
              src={logo.src}
              className="img-logo transform transition-transform duration-300 hover:scale-105 w-18 mb-4 cursor-pointer "
              alt={logo.alt}
            />
            <p className=" text-muted-foreground">
              Asociación Civil Argentina Reanima. Matrícula N° 48014
            </p>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Menú</h3>
            <nav className="space-y-2 text-sm">
              <Link
                href="/"
                className="block transition-colors  hover:text-gray-600"
              >
                Inicio
              </Link>
              <Link
                href="/quienes-somos"
                className="block transition-colors hover:text-gray-600"
              >
                ¿Quiénes somos?
              </Link>
              <Link
                href="/noticias"
                className="block transition-colors hover:text-gray-600"
              >
                Noticias
              </Link>
              <Link
                href="/actividades"
                className="block transition-colors hover:text-gray-600"
              >
                Actividades
              </Link>
              <Link
                href="/capacitaciones"
                className="block transition-colors hover:text-gray-600"
              >
                Cursos gratuitos
              </Link>

              <Link
                href="#"
                className="block transition-colors hover:text-gray-600"
              >
                Más
              </Link>

              <Link
                href="/contacto"
                className="block transition-colors hover:text-gray-600"
              >
                Contacto
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contacto</h3>
            <address className="space-y-2 text-sm not-italic">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <p>Teléfono: (0221) 418-1611</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <div>
                  Email:{" "}
                  <Link
                    className="hover:text-gray-600"
                    href="mailto:argentinareanima.ac@gmail.com"
                    target="_blank"
                  >
                    argentinareanima.ac@gmail.com
                  </Link>
                </div>
              </div>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">
              ¡Seguinos en nuestras redes!
            </h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        window.open(
                          "https://www.tiktok.com/@argentina.reanima",
                          "_blank"
                        )
                      }
                      variant="outline"
                      size="icon"
                      className="rounded-full cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        width="20"
                        height="20"
                        fill="black"
                      >
                        <path d="M208.005 78.284a78.366 78.366 0 0 1-43.999-13.224v74.941a63.96 63.96 0 1 1-63.96-63.96c1.792 0 3.56.088 5.3.255v35.994a28.06 28.06 0 1 0 28.06 28.06V0h33.457a44.823 44.823 0 0 0 6.435 22.847c7.934 13.285 22.347 22.176 38.707 22.947v32.49z" />
                      </svg>
                      <span className="sr-only">TikTok</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TikTok</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        window.open(
                          "https://www.facebook.com/profile.php?id=100087258240312",
                          "_blank"
                        )
                      }
                      variant="outline"
                      size="icon"
                      className="rounded-full cursor-pointer"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        window.open(
                          "https://www.instagram.com/argentinareanimaac",
                          "_blank"
                        )
                      }
                      variant="outline"
                      size="icon"
                      className="rounded-full cursor-pointer"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        window.open(
                          "https://www.youtube.com/channel/UCUe7YAlQawPP9VHg_1B172w",
                          "_blank"
                        )
                      }
                      variant="outline"
                      size="icon"
                      className="rounded-full cursor-pointer"
                    >
                      <Youtube className="h-4 w-4" />
                      <span className="sr-only">YouTube</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>YouTube</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Argentina Reanima. Todos los derechos reservados.
          </p>
          {/* <nav className="flex gap-4 text-sm">
            <Link href="#" className="transition-colors hover:text-gray-600">
              Política de Privacidad
            </Link>
            <Link href="#" className="transition-colors hover:text-gray-600">
              Configuración de Cookies
            </Link>
          </nav> */}
        </div>
      </div>
    </footer>
  );
}

export { Footer };
