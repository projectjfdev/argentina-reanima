import { Prisma } from "@/generated/prisma";
import cloudinary from "@/libs/cloudinary";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/news/[id]
export async function GET(request: NextRequest, context: any) {
  const id = Number(context.params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID inválido", success: false },
      { status: 400 }
    );
  }

  try {
    const news = await prisma.news.findFirst({
      where: { id },
    });

    if (!news) {
      return NextResponse.json(
        {
          message: `No se ha encontrado la noticia con el id ${id}`,
          success: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Noticia obtenida correctamente",
      news,
      success: true,
    });
  } catch (error) {
    console.error(`Error en GET /api/news/${id}:`, error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/news/[id]
export async function DELETE(request: NextRequest, context: any) {
  const id = Number(context.params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID inválido", success: false },
      { status: 400 }
    );
  }

  try {
    const deletedNews = await prisma.news.delete({
      where: { id },
    });

    if (!deletedNews) {
      return NextResponse.json(
        {
          message: `No se ha encontrado la noticia con el id ${id}`,
          success: false,
        },
        { status: 404 }
      );
    }

    // Si hay una imagen asociada, eliminarla de Cloudinary
    if (deletedNews.imagePublicId) {
      await cloudinary.uploader.destroy(deletedNews.imagePublicId);
    }

    return NextResponse.json({
      message: "Noticia eliminada correctamente",
      deletedNews,
      success: true,
    });
  } catch (error) {
    console.error(`Error en DELETE /api/news/${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log("Prisma error code:", error.code);
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/news/[id]
export async function PUT(request: NextRequest, context: any) {
  const id = Number(context.params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID inválido", success: false },
      { status: 400 }
    );
  }

  try {
    const { title, imageBase64, description, redirect, category, dateNew } =
      await request.json();

    const existingNews = await prisma.news.findUnique({ where: { id } });

    if (!existingNews) {
      return NextResponse.json(
        {
          message: `No se ha encontrado la noticia con el id ${id}`,
          success: false,
        },
        { status: 404 }
      );
    }

    let imageUrl = existingNews.imageUrl;
    let imagePublicId = existingNews.imagePublicId;

    if (imageBase64) {
      try {
        if (imagePublicId) {
          await cloudinary.uploader.destroy(imagePublicId);
        }
      } catch (err: any) {
        if (err.http_code !== 404) {
          console.error("Error al eliminar imagen de Cloudinary:", err);
          throw err;
        }
      }

      const uploadResult = await cloudinary.uploader.upload(imageBase64, {
        folder: "images",
        transformation: [
          {
            crop: "fill",
            quality: 60,
            format: "auto",
            strip_metadata: true,
            delivery: "auto",
            bytes_limit: 200000,
          },
        ],
      });

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title,
        imageUrl,
        imagePublicId,
        description,
        redirect,
        category,
        dateNew,
      },
    });

    return NextResponse.json({
      message: "Noticia actualizada correctamente",
      updatedNews,
      success: true,
    });
  } catch (error) {
    console.error("Error en PUT /api/news/[id]:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
