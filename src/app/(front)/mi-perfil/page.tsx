import { SignOutMenuButton } from "@/components/Buttons/SignOutMenuButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authOptions } from "@/libs/authOptions";
import {
  normalizeCertificateEmail,
  renderCertificateTextTemplate,
} from "@/libs/certificates";
import { prisma } from "@/libs/db";
import {
  Award,
  BadgeCheck,
  ExternalLink,
  FileText,
  Mail,
  UserRound,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function MiPerfilPage() {
  return (
    <Suspense fallback={<MiPerfilFallback />}>
      <MiPerfilContent />
    </Suspense>
  );
}

async function MiPerfilContent() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userName = session.user.name || "Usuario";
  const userEmail = session.user.email || "Email no disponible";
  const normalizedEmail = session.user.email
    ? normalizeCertificateEmail(session.user.email)
    : "";
  const userId = Number(session.user.id);
  const ownerFilters = [
    ...(normalizedEmail ? [{ recipientEmailNormalized: normalizedEmail }] : []),
    ...(Number.isInteger(userId) && userId > 0 ? [{ userId }] : []),
  ];
  const certificates =
    ownerFilters.length > 0
      ? await prisma.certificate.findMany({
          where: {
            status: "ACTIVE",
            OR: ownerFilters,
          },
          select: {
            publicId: true,
            recipientName: true,
            certificateText: true,
            templateKey: true,
            serialNumber: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full container px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Cuenta Argentina Reanima
          </p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Mi Perfil
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Consultá tu información personal y los certificados que Argentina
            Reanima te otorgó.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <nav aria-label="Navegacion de perfil" className="grid gap-1">
              <Link
                href="/mi-perfil"
                aria-current="page"
                className="flex items-center gap-3 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Mi Perfil
              </Link>
              <Link
                href="#certificados"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-[background-color,color,transform] duration-150 ease-out hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Award className="h-4 w-4" aria-hidden="true" />
                Mis certificados
              </Link>
              <div className="my-1 h-px bg-slate-200" />
              <SignOutMenuButton />
            </nav>
          </aside>

          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-normal text-slate-950">
                      Mis datos
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Información asociada a tu cuenta.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 py-5 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <UserRound className="h-4 w-4 text-primary" />
                      Nombre y apellido
                    </dt>
                    <dd className="mt-2 wrap-break-words text-base font-semibold text-slate-950">
                      {userName}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Mail className="h-4 w-4 text-primary" />
                      Email
                    </dt>
                    <dd className="mt-2 wrap-break-words text-base font-semibold text-slate-950">
                      {userEmail}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card
              id="certificados"
              className="scroll-mt-28 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm"
            >
              <CardHeader className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-yellow-600/10 text-yellow-600">
                    <Award className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-xl font-bold tracking-normal text-slate-950">
                    Mis certificados
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 py-8 sm:px-6">
                {certificates.length > 0 ? (
                  <div className="grid gap-3">
                    {certificates.map((certificate) => (
                      <article
                        key={certificate.publicId}
                        className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-bold tracking-normal text-slate-950">
                              Certificado
                            </h2>
                            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              Activo
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            Emitido para {certificate.recipientName}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                            {renderCertificateTextTemplate(
                              certificate.certificateText,
                              certificate.recipientName,
                            )}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>Serie {certificate.serialNumber}</span>
                          </div>
                        </div>
                        <Link
                          href={`/certificado/validar/${certificate.publicId}`}
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          Ver certificado
                          <ExternalLink
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mx-auto flex max-w-md flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                      <FileText className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h2 className="mt-5 text-lg font-bold tracking-normal text-slate-950">
                      Aún no tenés certificados
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Cuando Argentina Reanima te otorgue un certificado,
                      aparecerá aca para que puedas consultarlo.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="cursor-pointer mt-2 text-sm font-bold leading-6 text-primary underline transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          ¿Cómo obtener un certificado?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="h-auto max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-lg bg-white p-6 sm:p-8">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold tracking-normal text-slate-950">
                            ¿Cómo obtener un certificado?
                          </DialogTitle>
                          <DialogDescription className="mt-3 text-left text-sm leading-6 text-slate-600">
                            Para obtener un certificado, tenés que completar una
                            capacitación o actividad habilitada por Argentina
                            Reanima. Una vez emitido, el certificado aparecerá
                            automáticamente en esta sección de tu perfil.
                          </DialogDescription>
                        </DialogHeader>
                        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                          ¿Querés obtener un certificado pero todavía no
                          realizaste una capacitación?{" "}
                          <Link
                            href="/contacto"
                            className="font-semibold underline underline-offset-2 transition hover:text-emerald-900"
                          >
                            Contactate con nosotros
                          </Link>{" "}
                          para conocer las próximas capacitaciones y actividades
                          disponibles.
                        </p>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiPerfilFallback() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full container px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Cuenta Argentina Reanima
          </p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Mi Perfil
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Cargando informacion de tu cuenta...
          </p>
        </header>
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600 shadow-sm">
          Cargando certificados...
        </div>
      </section>
    </main>
  );
}
