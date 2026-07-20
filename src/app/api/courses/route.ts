import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { revalidateCourseViews } from "@/libs/cache/revalidation";
import { getPublicCourses } from "@/libs/courses/publicCourseQueries";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { courses, totalCourses } = await getPublicCourses({
      category: searchParams.get("category"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
    });

    return NextResponse.json({
      message: "Cursos obtenidos correctamente",
      courses,
      totalCourses,
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

export async function POST(req: Request) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const body = await req.json();
    const { title, category, lessons } = body;

    if (!title || !category || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        category,
        lessons: {
          create: lessons.map((lesson: { title: string; href: string }) => ({
            title: lesson.title,
            href: lesson.href,
          })),
        },
      },
      include: {
        lessons: true,
      },
    });
    revalidateCourseViews(newCourse.id);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creando curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const body = await req.json();
    const { id, title, category, lessons } = body;

    if (!id || !title || !category || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    await prisma.lesson.deleteMany({
      where: {
        courseId: id,
      },
    });

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        category,
        lessons: {
          create: lessons.map((lesson: { title: string; href: string }) => ({
            title: lesson.title,
            href: lesson.href,
          })),
        },
      },
      include: {
        lessons: true,
      },
    });
    revalidateCourseViews(id);
    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error("Error actualizando curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
