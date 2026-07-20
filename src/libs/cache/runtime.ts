import { connection } from "next/server";

export async function ensureRequestTimeRendering() {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return;
  }

  await connection();
}
