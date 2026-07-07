import { resetPasswordWithToken } from "@/libs/auth/passwordReset";
import { NextResponse } from "next/server";

const PASSWORD_MIN_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const token = typeof data.token === "string" ? data.token : "";
    const password = typeof data.password === "string" ? data.password : "";

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        {
          message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
          success: false,
        },
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken({ token, password });

    if (result.status !== "success") {
      return NextResponse.json(
        { message: result.message, success: false },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: result.message, success: true });
  } catch (error) {
    console.error("Error in /api/auth/reset-password:", error);

    return NextResponse.json(
      { error: "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}
