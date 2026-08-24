import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  updatedAt: string;
  intro: ReactNode;
  children: ReactNode;
};

export function LegalPage({
  title,
  updatedAt,
  intro,
  children,
}: LegalPageProps) {
  return (
    <main className="bg-slate-50 text-slate-950">
      <section className="container mx-auto px-4 py-14 md:py-20">
        <article className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <header className="border-b border-slate-200 pb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Documentación legal
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-sm font-medium text-slate-500">
              Última actualización: {updatedAt}
            </p>
            <div className="mt-6 space-y-4 text-base leading-8 text-slate-700">
              {intro}
            </div>
          </header>

          <div className="mt-8 space-y-9">{children}</div>
        </article>
      </section>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold leading-snug text-slate-950 md:text-2xl">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-8 text-slate-700">
        {children}
      </div>
    </section>
  );
}
