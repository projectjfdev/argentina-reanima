"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from "sonner";

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
          setResultado("Mensaje enviado con éxito");
          toast.success("Mensaje enviado con éxito", {
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
    <section className="pt-5 md:py-24 w-full flex justify-center">
      <div className="container">
        <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 text-5xl font-semibold lg:mb-1 lg:text-6xl">
                Contactanos
              </h1>
              <p className="text-muted-foreground">
                Respondemos a la brevedad. Tu mensaje es importante para
                nosotros.
              </p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-4 text-center text-2xl font-semibold lg:text-left">
                Detalles de contacto
              </h3>
              <ul className="ml-4 list-disc">
                <li>
                  <span className="font-bold">Teléfono: </span>
                  (0221) 418-1611
                </li>
                <li>
                  <span className="font-bold">Email: </span>
                  <a
                    href="mailto:argentinareanima.ac@gmail.com"
                    className="hover:text-gray-500"
                  >
                    argentinareanima.ac@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <form
            className="mx-auto flex max-w-screen-md flex-col gap-6 rounded-lg border p-10"
            onSubmit={sendEmail}
          >
            <div className="flex gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ingrese su nombre"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="lastname">Apellido</Label>
                <Input
                  type="text"
                  id="lastname"
                  name="lastname"
                  required
                  placeholder="Ingrese su apellido"
                />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Ingrese su email"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                type="text"
                id="subject"
                name="subject"
                placeholder="Asunto"
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                required
                placeholder="Escribe tu mensaje"
              />
            </div>
            <Button type="submit" className="w-full">
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        </div>
      </div>
      <Toaster />
    </section>
  );
};
