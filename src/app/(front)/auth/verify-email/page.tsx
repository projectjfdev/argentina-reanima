import { Button } from "@/components/ui/button";
import { verifyEmailToken } from "@/libs/auth/emailVerification";
import Link from "next/link";

const TITLE_BY_STATUS = {
  success: "Email confirmado",
  "already-verified": "Email ya confirmado",
  invalid: "Link invalido",
  expired: "Link vencido",
} as const;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const result = await verifyEmailToken(token);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800">
          {TITLE_BY_STATUS[result.status]}
        </h1>
        <p className="mt-4 text-sm text-gray-600">{result.message}</p>
        <Button asChild className="mt-6 w-full">
          <Link href="/auth/login">Ingresar</Link>
        </Button>
      </div>
    </div>
  );
}
