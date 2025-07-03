import { Footer } from "@/components/Footer/Footer";
import { Navbar } from "@/components/Navbar/navbar";
import type { Metadata } from "next";
{
  /* ----- SEO ----- */
}

export const metadata: Metadata = {
  title: "Argentina Reanima",
  description: "Argentina Reanima.",
  openGraph: {
    title: "Argentina Reanima",
    url: "https://argentinareanima.com.ar",
    description: "Argentina Reanima.",
    images: [{ url: "/logo/logo.png" }],
  },
  icons: {
    icon: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <div>{children}</div>
      <Footer />
    </div>
  );
}
