import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardAuthFallback />}>
      <DashboardAuthGate>{children}</DashboardAuthGate>
    </Suspense>
  );
}

async function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/auth/login?error=unauthorized");
  }

  return children;
}

function DashboardAuthFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-700">
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-medium shadow-sm">
        Validando acceso...
      </div>
    </main>
  );
}
