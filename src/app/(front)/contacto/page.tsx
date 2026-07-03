import { ContactForm } from "@/components/ContactForm/ContactForm";
import { ArrowDown, HeartPulse, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const contactImage =
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748027840/banner-contacto_iukk0c.png";

const ContactoPage = () => {
  return (
    <main className="bg-white text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 pt-24">
        <div className="absolute inset-0 z-0">
          <Image
            src={contactImage}
            alt="Argentina Reanima - contacto institucional"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/58 to-slate-950/20" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <HeartPulse className="h-4 w-4 text-primary" />
              Contacto institucional
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Hablemos sobre capacitaciones, alianzas y actividades.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
              Comunicate con Argentina Reanima para consultas institucionales,
              informacion sobre actividades o propuestas de colaboracion.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#formulario-contacto"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary/90"
              >
                Completar formulario <ArrowDown className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="mailto:argentinareanima.ac@gmail.com"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white hover:text-slate-950"
              >
                Enviar email <Mail className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-4 px-4 py-10 md:grid-cols-3 md:py-14">
        {[
          {
            icon: Mail,
            label: "Email",
            value: "argentinareanima.ac@gmail.com",
            href: "mailto:argentinareanima.ac@gmail.com",
          },
          {
            icon: Phone,
            label: "Telefono",
            value: "(0221) 418-1611",
            href: "tel:+542214181611",
          },
          {
            icon: HeartPulse,
            label: "Consultas",
            value: "Actividades, alianzas y capacitaciones",
            href: "#formulario-contacto",
          },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-950 group-hover:text-primary">
              {item.value}
            </p>
          </a>
        ))}
      </section>

      <ContactForm />
    </main>
  );
};

export default ContactoPage;
