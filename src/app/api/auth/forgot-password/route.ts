import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "@/libs/auth/passwordReset";
import { prisma } from "@/libs/db";
import { sendPasswordResetEmail } from "@/libs/email/resend";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RESET_TOKEN_HOURS = 1;
const GENERIC_MESSAGE =
  "Si el email corresponde a una cuenta, te enviaremos un link para cambiar la contraseña.";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const email =
      typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Ingresa un email valido", success: false },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ message: GENERIC_MESSAGE, success: true });
    }

    const resetToken = createPasswordResetToken();
    const tokenHash = hashPasswordResetToken(resetToken);
    const expiresAt = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_HOURS * 60 * 60 * 1000,
    );

    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      }),
    ]);

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        token: resetToken,
      });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE, success: true });
  } catch (error) {
    console.error("Error in /api/auth/forgot-password:", error);

    return NextResponse.json(
      { error: "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}
