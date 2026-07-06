import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "No autenticado", success: false },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "No autorizado", success: false },
      { status: 403 }
    );
  }

  return null;
}
