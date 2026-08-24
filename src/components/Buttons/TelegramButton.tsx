"use client";

import { useState } from "react";

export default function TelegramButton() {
  const [isSending, setIsSending] = useState(false);

  const sendTelegramMessage = async () => {
    if (isSending) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Error al enviar el mensaje");
      }

      alert("Mensaje enviado");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al enviar el mensaje");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={sendTelegramMessage}
      disabled={isSending}
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSending ? "Enviando..." : "Enviar mensaje de prueba"}
    </button>
  );
}
