import { prisma } from "@/libs/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

export type PasswordResetResult =
  | { status: "success"; message: string }
  | { status: "invalid"; message: string }
  | { status: "expired"; message: string };

export function createPasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function resetPasswordWithToken({
  token,
  password,
}: {
  token: string;
  password: string;
}): Promise<PasswordResetResult> {
  if (!token) {
    return {
      status: "invalid",
      message: "El link de recuperación no es válido.",
    };
  }

  const tokenHash = hashPasswordResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt) {
    return {
      status: "invalid",
      message: "El link de recuperación no es válido.",
    };
  }

  if (resetToken.expiresAt < new Date()) {
    return {
      status: "expired",
      message: "El link de recuperación venció.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const consumedToken = await prisma.$transaction(async (tx) => {
    const tokenUpdate = await tx.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    if (tokenUpdate.count !== 1) {
      return false;
    }

    await tx.user.update({
      where: { id: resetToken.userId },
      data: {
        password: passwordHash,
        emailVerified: resetToken.user.emailVerified ?? new Date(),
      },
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: { not: resetToken.id },
      },
      data: { usedAt: new Date() },
    });

    return true;
  });

  if (!consumedToken) {
    return {
      status: "invalid",
      message: "El link de recuperación no es válido.",
    };
  }

  return {
    status: "success",
    message: "Tu contraseña fue actualizada correctamente.",
  };
}
