import { prisma } from "@/libs/db";
import crypto from "crypto";

export type EmailVerificationResult =
  | { status: "success"; message: string }
  | { status: "already-verified"; message: string }
  | { status: "invalid"; message: string }
  | { status: "expired"; message: string };

export function hashVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function verifyEmailToken(
  token: string,
): Promise<EmailVerificationResult> {
  if (!token) {
    return {
      status: "invalid",
      message: "Token invalido.",
    };
  }

  const tokenHash = hashVerificationToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!verificationToken) {
    return {
      status: "invalid",
      message: "Token invalido.",
    };
  }

  if (verificationToken.user.emailVerified) {
    return {
      status: "already-verified",
      message: "El email ya estaba confirmado.",
    };
  }

  if (verificationToken.usedAt) {
    return {
      status: "invalid",
      message: "Token invalido.",
    };
  }

  if (verificationToken.expiresAt < new Date()) {
    return {
      status: "expired",
      message: "El link de confirmacion venció.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return {
    status: "success",
    message: "Email confirmado correctamente.",
  };
}
