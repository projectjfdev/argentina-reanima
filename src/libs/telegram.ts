type TelegramSendMessageResult =
  | { success: true }
  | { success: false; error: string; status: number };

function getTelegramEnvValue(key: "TELEGRAM_BOT_TOKEN" | "TELEGRAM_CHAT_ID") {
  const value = process.env[key]?.trim();

  if (!value) return "";

  return value.replace(/^['"]|['"]$/g, "");
}

export function escapeTelegramHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function sendTelegramMessage(
  text: string,
): Promise<TelegramSendMessageResult> {
  const token = getTelegramEnvValue("TELEGRAM_BOT_TOKEN");
  const chatId = getTelegramEnvValue("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    return {
      success: false,
      error: "Faltan variables de entorno de Telegram.",
      status: 500,
    };
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          parse_mode: "HTML",
          text,
        }),
      },
    );

    const data = await telegramResponse.json().catch(() => null);

    if (!telegramResponse.ok || !data?.ok) {
      return {
        success: false,
        error:
          data?.description ??
          `Telegram respondio con estado ${telegramResponse.status}`,
        status: telegramResponse.status || 502,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending Telegram message:", error);

    return {
      success: false,
      error: "No se pudo conectar con Telegram.",
      status: 502,
    };
  }
}
