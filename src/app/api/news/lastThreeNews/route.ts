import { prisma } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        dateNew: "desc",
      },
      take: 3,
    });

    return NextResponse.json({
      message: "Últimas 3 noticias obtenidas correctamente",
      news,
      status: 200,
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
