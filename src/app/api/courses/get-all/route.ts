import { prisma } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await prisma.course.findMany();

    return NextResponse.json({
      message: "Todos los cursos",
      total: courses.length,
      courses,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error in /api/courses:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
