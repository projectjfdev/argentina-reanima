import { Prisma } from "@/generated/prisma";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: any) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: numericId },
      include: { lessons: true },
    });

    if (!course) {
      return NextResponse.json(
        {
          message: `No se encontró el curso con id ${numericId}`,
          success: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Curso encontrado",
      course,
      success: true,
    });
  } catch (error) {
    console.error(`Error al obtener curso con id ${numericId}:`, error);
    return NextResponse.json(
      { message: "Error interno del servidor", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: any) {
  const id = Number(context.params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, category, lessons } = body;

    if (!title || !category || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    await prisma.lesson.deleteMany({ where: { courseId: id } });

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
      include: { lessons: true },
    });

    return NextResponse.json({
      message: "Curso actualizado correctamente",
      updatedCourse,
      success: true,
    });
  } catch (error) {
    console.error("Error actualizando curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const id = Number(context.params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const deletedCourse = await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Curso eliminado correctamente",
      deletedCourse,
      success: true,
    });
  } catch (error) {
    console.error(`Error al eliminar curso con id ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error.code, error.message);
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
