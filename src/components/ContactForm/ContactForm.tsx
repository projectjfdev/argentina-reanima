"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
} from "lucide-react";
import React, { useState } from "react";
import { Toaster, toast } from "sonner";

const supportItems = [
  {
    icon: Clock3,
    title: "Respuesta cercana",
    text: "Leemos cada consulta y respondemos a la brevedad.",
  },
  {
    icon: ShieldCheck,
    title: "Canal institucional",
    text: "Usa este formulario para alianzas, actividades y capacitaciones.",
  },
  {
    icon: CheckCircle2,
    title: "Datos claros",
    text: "Inclui el motivo de contacto para derivar mejor tu mensaje.",
  },
];

export const ContactForm = () => {
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const res = emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
        form,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string
      )
      .then(
        (result) => {
          setResultado("Mensaje enviado con exito");
          toast.success("Mensaje enviado con exito", {
            description:
              "Gracias por contactarnos. Nos pondremos en contacto a la brevedad. ",
            duration: 10000,
            action: {
              label: "X",
              onClick: () => {
                window.close();
              },
            },
          });
          form.reset();
        },
        (error) => {
          setResultado("Error al enviar el mensaje");
          console.log(error.text);
        }
      )
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section
      id="formulario-contacto"
      className="w-full bg-slate-50 px-4 py-16 md:py-24"
    >
      <div className="container mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="lg:pt-4"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Escribinos
            </p>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Contanos como podemos ayudarte.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              Para consultas sobre capacitaciones, actividades institucionales
              o alianzas, completa el formulario con tus datos y el motivo del
              contacto.
            </p>

            <div className="mt-8 space-y-4">
              {supportItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.38,
                    ease: "easeOut",
                    delay: index * 0.06,
                  }}
                  className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <MessageSquareText className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-slate-950">
                    Tambien podes contactarnos directamente
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <a
                      href="mailto:argentinareanima.ac@gmail.com"
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      argentinareanima.ac@gmail.com
                    </a>
                    <a
                      href="tel:+542214181611"
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      (0221) 418-1611
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.form
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 md:p-8"
            onSubmit={sendEmail}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
          >
            <div className="mb-7 border-b border-slate-200 pb-6">
              <h3 className="text-2xl font-semibold text-slate-950">
                Formulario de contacto
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Los campos marcados como obligatorios son necesarios para poder
                responder tu consulta.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nombre" htmlFor="name" required>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  className="h-12 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                />
              </Field>
              <Field label="Apellido" htmlFor="lastname" required>
                <Input
                  type="text"
                  id="lastname"
                  name="lastname"
                  required
                  placeholder="Tu apellido"
                  className="h-12 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-5">
              <Field label="Email" htmlFor="email" required>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="nombre@email.com"
                  className="h-12 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                />
              </Field>

              <Field label="Asunto" htmlFor="subject">
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Motivo del contacto"
                  className="h-12 border-slate-300 bg-slate-50 text-slate-950 focus-visible:ring-primary"
                />
              </Field>

              <Field label="Mensaje" htmlFor="message" required>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Escribi tu mensaje"
                  className="min-h-40 border-slate-300 bg-slate-50 text-slate-950 focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </Field>
            </div>

            {resultado && (
              <p className="mt-4 text-sm font-medium text-slate-600">
                {resultado}
              </p>
            )}

            <Button
              type="submit"
              className="mt-7 h-12 w-full bg-primary text-white hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </motion.form>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

const Field = ({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
};
