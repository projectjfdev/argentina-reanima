import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { revalidateNewsViews } from "@/libs/cache/revalidation";
import cloudinary from "@/libs/cloudinary";
import { getPublicNews } from "@/libs/news/publicNewsQueries";
import { prisma } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { news, totalNews, currentPage } = await getPublicNews({
      category: searchParams.get("category"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
    });

    return NextResponse.json({
      message: "Noticias obtenidas correctamente",
      news,
      totalNews,
      currentPage,
      success: true,
    });
  } catch (error) {
    console.error("Error in /api/news:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const {
      title,
      description,
      redirect,
      category,
      imageBase64, // opcional
      dateNew,
    } = await request.json();

    if (!title || !description || !redirect || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (imageBase64) {
      const uploadResult = await cloudinary.uploader.upload(imageBase64, {
        folder: "images",
        transformation: [
          {
            crop: "fill",
            quality: 60,
            format: "auto",
            strip_metadata: true,
          },
        ],
      });

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const news = await prisma.news.create({
      data: {
        title,
        description,
        redirect,
        category,
        imageUrl,
        imagePublicId,
        dateNew,
      },
    });
    revalidateNewsViews(news.id);
    return NextResponse.json(
      { message: "Noticia creada exitosamente", news, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear noticia:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
