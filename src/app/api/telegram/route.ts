import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/libs/telegram";

export async function POST() {
  const result = await sendTelegramMessage(
    `
<b>Mensaje de prueba</b>

Hola

Este mensaje fue enviado desde <b>Next.js</b> usando la API de Telegram.

Hora: ${new Date().toLocaleString("es-AR")}
    `.trim(),
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}
