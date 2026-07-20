import { ensureRequestTimeRendering } from "@/libs/cache/runtime";
import { verifyEmailToken } from "@/libs/auth/emailVerification";
import { NextRequest, NextResponse } from "next/server";

const STATUS_CODE_BY_RESULT = {
  success: 200,
  "already-verified": 200,
  invalid: 400,
  expired: 410,
} as const;

export async function GET(request: NextRequest) {
  await ensureRequestTimeRendering();

  const token = request.nextUrl.searchParams.get("token") || "";
  const result = await verifyEmailToken(token);

  return NextResponse.json(
    {
      success:
        result.status === "success" || result.status === "already-verified",
      status: result.status,
      message: result.message,
    },
    { status: STATUS_CODE_BY_RESULT[result.status] }
  );
}
