import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, Clock3, MapPin, ShieldCheck } from "lucide-react";

const title = "Quiero ser parte: nuestro compromiso con El Carmen";
const description = "Argentina Reanima comunica el cierre de la campaña Quiero ser parte, la instalación del DEA en Bomberos de El Carmen y los próximos pasos.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/comunicado-quiero-ser-parte-el-carmen" },
  openGraph: {
    title,
    description,
    url: "/comunicado-quiero-ser-parte-el-carmen",
    type: "article",
    locale: "es_AR",
    images: [{ url: "/logo/logo.png", alt: "Argentina Reanima" }],
  },
};

const nextSteps = [
  { number: "01", title: "Cierre de la campaña", detail: "Hasta el viernes 20 de noviembre se podrán realizar aportes para acercarnos a la meta estimada de $3.200.000." },
  { number: "02", title: "Adquisición e instalación", detail: "Argentina Reanima aportará el dinero faltante. Compraremos el DEA, su gabinete y la cartelería para donarlos e instalarlos en el destacamento." },
  { number: "03", title: "Capacitación y seguimiento", detail: "Capacitaremos en RCP y uso del DEA al personal de Bomberos de El Carmen y a la comunidad educativa. Informaremos cada etapa hasta concretar la donación." },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#227e9e]">{children}</p>;
}

export default function ComunicadoQuieroSerParteElCarmenPage() {
  return (
    <main className="bg-white text-slate-950">
      <article>
        <header className="border-l-4 border-[#2c9cc1] bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20 lg:pb-28 lg:pt-32">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Comunicado institucional · Quiero ser parte</p>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Una palabra empeñada. <span className="text-sky-300">Un compromiso que vamos a cumplir.</span></h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">El barrio El Carmen, en Berisso, tendrá su desfibrilador externo automático (DEA). Argentina Reanima aportará el dinero que falte para concretar la donación.</p>
              <a href="#compromiso" className="mt-9 inline-flex min-h-12 items-center gap-2 border-b-2 border-sky-300 py-2 text-sm font-semibold hover:text-sky-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300">Conocé la decisión <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
            </div>
            <aside className="self-end border-t border-white/25 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" aria-label="Datos de la campaña">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">La campaña</p>
              <p className="mt-4 text-2xl font-semibold leading-snug">Quiero ser parte de una nueva oportunidad</p>
              <div className="mt-7 space-y-4 text-sm leading-6 text-slate-200">
                <p className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" /> Barrio El Carmen · Berisso</p>
                <p className="flex gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" /> Cierre anunciado: viernes 20 de noviembre</p>
                <p>Meta estimada: $3.200.000</p>
              </div>
            </aside>
          </div>
        </header>

        <section id="compromiso" aria-labelledby="compromiso-title" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-20">
            <SectionLabel>01 / Nuestra palabra</SectionLabel>
            <div className="max-w-3xl">
              <h2 id="compromiso-title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Nos comprometimos y vamos a cumplir.</h2>
              <div className="mt-8 space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
                <p>Hace poco más de dos meses iniciamos esta campaña para dotar a la comunidad de El Carmen de un DEA, su gabinete, señalización y capacitación. Gracias a muchas personas reunimos una suma muy importante, aunque todavía insuficiente para alcanzar todo el objetivo.</p>
                <p>Desde el primer día pusimos a trabajar nuestras herramientas: creamos en el sitio un sistema para seguir la recaudación con transparencia, difundimos la iniciativa en redes y otros espacios e instalamos cartelería para acercarla a las familias y los vecinos. Cada pequeño aporte suma y puede hacer una gran diferencia.</p>
                <p className="border-l-4 border-[#fd2d2b] pl-5 text-xl font-semibold leading-8 text-slate-950 sm:text-2xl">Argentina Reanima aportará la totalidad del dinero faltante para concretar la donación.</p>
                <p>La palabra que dimos a esta comunidad vale más que el resultado de una recaudación. Asumimos ese compromiso y nos hacemos responsables de cumplirlo.</p>
              </div>
              <Link href="/quiero-ser-parte" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#2c9cc1] px-6 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#227e9e] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c9cc1]">Ver la campaña y sus aportes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="ubicacion-title" className="bg-[#f1f7f9] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-20">
            <SectionLabel>02 / Nueva ubicación</SectionLabel>
            <div className="max-w-3xl">
              <h2 id="ubicacion-title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Un DEA disponible para toda la comunidad.</h2>
              <div className="mt-8 space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
                <p>Al comenzar la campaña anunciamos que el desfibrilador se instalaría en la escuela. Después de evaluar las posibilidades y consensuarlo con la institución educativa, decidimos instalarlo en el <strong className="font-semibold text-slate-950">Destacamento de Bomberos de El Carmen</strong>, a escasos metros de las escuelas.</p>
                <p>Allí el equipo podrá estar disponible <strong className="font-semibold text-slate-950">las 24 horas del día, los 365 días del año</strong>. Así, alumnos, docentes y auxiliares, junto con las familias y todos los vecinos, podrán contar con un recurso fundamental ante una situación de muerte súbita.</p>
                <p>Agradecemos especialmente a la escuela por abrirnos sus puertas desde el inicio y acompañar esta decisión en beneficio de toda la comunidad.</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="confianza-title" className="px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-20">
            <SectionLabel>03 / Respeto y transparencia</SectionLabel>
            <div className="max-w-3xl">
              <ShieldCheck className="mb-6 h-9 w-9 text-[#2c9cc1]" strokeWidth={1.5} aria-hidden="true" />
              <h2 id="confianza-title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">La confianza merece una respuesta clara.</h2>
              <div className="mt-8 space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
                <p>Sabemos que cada aporte se hizo confiando en un objetivo determinado. Por eso comunicamos con transparencia el cambio de ubicación, aunque estamos convencidos de que amplía el beneficio de la donación.</p>
                <p>Si una persona que ya aportó no comparte la decisión de instalar el DEA en Bomberos de El Carmen, <strong className="font-semibold text-slate-950">Argentina Reanima se compromete a devolverle íntegramente su contribución, con la actualización monetaria correspondiente.</strong> Respetamos esa posición y nos hacemos cargo de cada decisión que tomamos.</p>
              </div>
              <Link href="/contacto#formulario-contacto" className="mt-9 inline-flex min-h-12 items-center gap-2 border-b-2 border-[#2c9cc1] py-2 text-sm font-semibold hover:text-[#227e9e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c9cc1]">Contactarnos por un aporte <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="pasos-title" className="bg-slate-950 px-5 py-20 text-white sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">04 / Lo que sigue</p>
            <h2 id="pasos-title" className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">De la campaña a una nueva oportunidad.</h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
              {nextSteps.map((step) => <li key={step.number} className="border-t border-white/25 pt-5"><span className="text-sm font-semibold tracking-widest text-sky-300">{step.number}</span><h3 className="mt-4 text-xl font-semibold">{step.title}</h3><p className="mt-3 text-base leading-7 text-slate-300">{step.detail}</p></li>)}
            </ol>
          </div>
        </section>

        <section aria-labelledby="gracias-title" className="px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>Gracias por haber sido parte</SectionLabel>
            <h2 id="gracias-title" className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Esta oportunidad también la construyeron ustedes.</h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
              <p>Gracias a cada persona que aportó, sin importar el monto; a quienes compartieron la campaña y ayudaron a acercarla a otros; a los medios que brindaron sus espacios y a todos los que nos acompañaron.</p>
              <p>Esta experiencia nos deja aprendizajes y cosas por mejorar. Pusimos nuestro esfuerzo, nuestras herramientas y nuestra voluntad al servicio de este objetivo. Lo reunido fue posible gracias a ustedes; lo que falta lo aportará Argentina Reanima.</p>
              <p>Nuestro compromiso con El Carmen nace de la palabra que dimos y de la convicción de que cada comunidad merece herramientas y personas capacitadas para responder ante una emergencia. Su DEA dará a los vecinos una nueva oportunidad de recibir asistencia inmediata ante un paro cardíaco y aumentará sus posibilidades de sobrevivir.</p>
            </div>
            <p className="mt-10 border-l-4 border-[#fd2d2b] pl-5 text-xl font-semibold leading-8">Seguiremos aprendiendo y trabajando. En Argentina Reanima solo bajamos los brazos para hacer y enseñar RCP.</p>
            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Asociación Civil Argentina Reanima <span className="mt-2 block font-normal normal-case tracking-normal">Luchamos contra la muerte súbita.</span></p>
          </div>
        </section>
      </article>
    </main>
  );
}
