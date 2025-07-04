// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NewsProvider } from "@/context/NewsContext";
import { CourseProvider } from "@/context/CourseContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.argentinareanima.org.ar"),
  title: "Argentina reanima",
  description:
    "Somos una organización argentina dedicada a la formación en Reanimación Cardiopulmonar (RCP) y uso del Desfibrilador Externo Automático (DEA)",
  keywords: [
    "RCP",
    "Maniobra de Heimlich",
    "Reanimación en adultos y niños",
    "Cursos de RCP",
    "Paro Cardíaco",
  ],
  openGraph: {
    title: "Argentina reanima",
    description:
      "Dedicamos nuestros esfuerzos en luchar contra la muerte súbita",
    url: "https://www.argentinareanima.org.ar/",
    siteName: "Argentina reanima",
    images: [
      {
        url: "/images/4.jpeg",
        width: 1200,
        height: 630,
        alt: "Argentina reanima",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  alternates: {
    canonical: "https://www.argentinareanima.org.ar/", // para evitar contenido duplicado
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" translate="no">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NewsProvider>
          <CourseProvider>{children}</CourseProvider>
        </NewsProvider>
      </body>
    </html>
  );
}
