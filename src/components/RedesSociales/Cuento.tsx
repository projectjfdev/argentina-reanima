"use client";

import { useMobile } from "@/hooks/useMedia";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, ExternalLink, HeartPulse } from "lucide-react";

export default function Cuento() {
  const isMobile = useMobile();

  return (
    <section
      className="w-full bg-white px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white"
      id="gala-y-el-gran-latido"
    >
      <div className="mx-auto container">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* Texto */}
          <article className="space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <HeartPulse className="h-4 w-4" />
                Educación temprana en RCP y DEA
              </span>

              <div>
                <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  Sembrando el “Gran Latido” en las nuevas generaciones
                </h2>

                <div className="mt-4 h-1.5 w-24 rounded-full bg-primary" />
              </div>

              <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
                Desde la Asociación Civil Argentina Reanima, presentamos con
                profunda emoción{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  “Gala y el gran latido: Un cuento sobre la amistad y cómo
                  salvar una vida”
                </strong>
                .
              </p>
            </div>

            <div className="space-y-5 text-base leading-8 text-slate-700 dark:text-slate-300 md:text-lg">
              <p>
                Este recurso es el resultado de un esfuerzo conjunto con la
                Facultad de Psicología de la Universidad Nacional de Mar del
                Plata y el Proyecto de Extensión{" "}
                <em className="font-medium text-slate-800 dark:text-slate-200">
                  “Nacer entre palabras”
                </em>
                .
              </p>

              <p>
                Su autor,{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  Santiago González Goller
                </strong>
                , combina en estas páginas su experiencia como papá, instructor
                de RCP y guardavidas, logrando un material que trasciende la
                simple instrucción técnica.
              </p>

              <p>
                Incorporar la enseñanza de RCP y el uso del DEA desde edades
                tempranas permite que los niños y niñas integren estos pasos
                como parte de su lenguaje cotidiano. Al enseñar jugando,
                transformamos un evento potencialmente traumático en una
                oportunidad de aprendizaje y empoderamiento.
              </p>

              <div className="rounded-2xl bg-primary/5 p-5 ring-1 ring-primary/15">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  Este cuento aborda una necesidad vital: la gestión del miedo
                  ante lo inesperado.
                </p>
                <p className="mt-3">
                  Cuando un niño sabe cómo pedir ayuda al{" "}
                  <strong className="font-semibold text-slate-900 dark:text-white">
                    107
                  </strong>{" "}
                  y conoce la importancia de actuar rápido, el temor se
                  transforma en capacidad y seguridad emocional.
                </p>
              </div>

              <p>
                Como bien se refleja en la historia de Gala, ante una
                emergencia, el conocimiento permite{" "}
                <em className="font-medium text-slate-800 dark:text-slate-200">
                  “tomar el control y trabajar en equipo”
                </em>
                , reduciendo la ansiedad y fomentando una resiliencia activa.
              </p>

              <p>
                Nuestra apuesta es clara: confiamos en que las futuras
                generaciones sean más receptivas y abiertas a estos temas. Al
                naturalizar la prevención, estamos formando adultos que no
                dudarán en intervenir.
              </p>

              <p>
                Queremos que, al igual que en la Sabana Alegre, todos los niños
                y niñas sepan que{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  “el corazón más fuerte es el que se atreve a ayudar”
                </strong>
                .
              </p>

              <p>
                Este cuento es una herramienta para familias, docentes e
                instituciones que buscan dar cumplimiento a la{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  Ley N.º 27.159/15 de Muerte Súbita
                </strong>{" "}
                desde una perspectiva de amor y responsabilidad colectiva.
              </p>

              <p>
                Invitamos a toda la sociedad a utilizar este material para
                construir entornos más empáticos y preparados, porque las
                semillas que plantamos hoy en los más pequeños serán los latidos
                que salvarán vidas mañana.
              </p>
            </div>

            <footer className="rounded-2xl bg-slate-50 p-5 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white">
                Asociación Civil Argentina Reanima
              </p>
              <p className="mt-1 italic">
                “Solo bajamos los brazos para hacer RCP”
              </p>
            </footer>
          </article>

          {/* PDF */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl bg-slate-50 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Gala y el gran latido
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Cuento en PDF
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {isMobile ? (
                  <div className="space-y-4 rounded-2xl bg-white p-5 text-center ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Abrí el cuento en una pestaña nueva para leerlo
                      cómodamente.
                    </p>

                    <Button asChild className="w-full">
                      <a
                        href="/Cuento-Gala-y-el-gran-latido.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir cuento
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>

                    <Button asChild variant="outline" className="w-full">
                      <a href="/Cuento-Gala-y-el-gran-latido.pdf" download>
                        Descargar PDF
                        <Download className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <iframe
                    title="Gala y el gran latido"
                    src="/Cuento-Gala-y-el-gran-latido.pdf"
                    className="h-195 w-full rounded-2xl bg-white"
                  />
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
