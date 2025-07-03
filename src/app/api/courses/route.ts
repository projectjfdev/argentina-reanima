import { Prisma } from "@/generated/prisma";
import { prisma } from "@/libs/db";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const pageParam = searchParams.get("page") || "1";

    const page = Math.max(parseInt(pageParam, 10) || 1, 1);
    const limit = 6; // puedes ajustar el límite como necesites
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      ...(category && { category }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    // Obtener los cursos paginados
    const courses = await prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lessons: true,
      },
    });

    // Total de cursos que coinciden con el filtro
    const totalCourses = await prisma.course.count({ where });

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
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, lessons } = body;

    if (!title || !category || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
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
    revalidatePath("/api/courses");
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creando curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, category, lessons } = body;

    if (!id || !title || !category || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Primero, eliminar lecciones antiguas del curso
    await prisma.lesson.deleteMany({
      where: {
        courseId: id,
      },
    });

    // Luego, actualizar título y categoría del curso y crear las nuevas lecciones
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
    revalidatePath("/api/courses");
    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error("Error actualizando curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
