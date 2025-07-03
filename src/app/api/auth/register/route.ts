import { prisma } from "@/libs/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const emailFound = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (emailFound) {
      return NextResponse.json(
        { message: "El email ya existe" },
        { status: 409 }
      );
    }

    const usernameFound = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (usernameFound) {
      return NextResponse.json(
        { message: "El username ya existe" },
        { status: 409 }
      );
    }
    const hashPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashPassword,
      },
    });

    const { password: _, ...user } = newUser;

    return NextResponse.json({
      message: "Usuario creado correctamente",
      user,
      status: 201,
      success: true,
    });
  } catch (error) {
    console.error("Error in /api/auth/register:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
