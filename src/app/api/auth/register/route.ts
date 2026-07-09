import {
  createVerificationToken,
  hashVerificationToken,
} from "@/libs/auth/emailVerification";
import {
  linkCertificatesToUserByEmail,
  normalizeCertificateEmail,
} from "@/libs/certificates";
import { prisma } from "@/libs/db";
import { sendConfirmEmail } from "@/libs/email/resend";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const VERIFICATION_TOKEN_HOURS = 24;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const name = typeof data.name === "string" ? data.name.trim() : "";
    const email =
      typeof data.email === "string"
        ? normalizeCertificateEmail(data.email)
        : "";
    const password = typeof data.password === "string" ? data.password : "";

    if (!name) {
      return NextResponse.json(
        { message: "El nombre es obligatorio", success: false },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "El email no es valido", success: false },
        { status: 400 },
      );
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        {
          message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
          success: false,
        },
        { status: 400 },
      );
    }

    const emailFound = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (emailFound) {
      return NextResponse.json(
        { message: "El email ya existe", success: false },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = createVerificationToken();
    const tokenHash = hashVerificationToken(verificationToken);
    const expiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_HOURS * 60 * 60 * 1000,
    );

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role: "USER",
          emailVerified: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
        },
      });

      await tx.emailVerificationToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      await linkCertificatesToUserByEmail(tx, user.id, user.email);

      return user;
    });

    try {
      await sendConfirmEmail({
        email: newUser.email,
        name: newUser.name,
        token: verificationToken,
      });
    } catch (emailError) {
      await prisma.user.delete({
        where: { id: newUser.id },
      });

      throw emailError;
    }

    return NextResponse.json(
      {
        message:
          "Te enviamos un email de confirmacion. Revisa tu correo para activar la cuenta.",
        user: newUser,
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in /api/auth/register:", error);

    return NextResponse.json(
      { error: "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}
