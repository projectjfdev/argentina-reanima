import { verifyEmailToken } from "@/libs/auth/emailVerification";
import { GET } from "@/app/api/auth/verify-email/route";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/libs/auth/emailVerification", () => ({
  verifyEmailToken: vi.fn(),
}));

const verifyEmailTokenMock = vi.mocked(verifyEmailToken);

function createVerifyEmailRequest(token: string) {
  return new NextRequest(
    `http://localhost/api/auth/verify-email?token=${encodeURIComponent(token)}`,
  );
}

describe("GET /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when verification succeeds", async () => {
    verifyEmailTokenMock.mockResolvedValue({
      status: "success",
      message: "Email confirmado correctamente.",
    });

    const response = await GET(createVerifyEmailRequest("email-token"));

    await expect(response.json()).resolves.toEqual({
      success: true,
      status: "success",
      message: "Email confirmado correctamente.",
    });
    expect(response.status).toBe(200);
    expect(verifyEmailTokenMock).toHaveBeenCalledWith("email-token");
  });

  it("returns 200 when email is already verified", async () => {
    verifyEmailTokenMock.mockResolvedValue({
      status: "already-verified",
      message: "El email ya estaba confirmado.",
    });

    const response = await GET(createVerifyEmailRequest("email-token"));

    await expect(response.json()).resolves.toEqual({
      success: true,
      status: "already-verified",
      message: "El email ya estaba confirmado.",
    });
    expect(response.status).toBe(200);
  });

  it("returns 400 when token is invalid", async () => {
    verifyEmailTokenMock.mockResolvedValue({
      status: "invalid",
      message: "Token invalido.",
    });

    const response = await GET(createVerifyEmailRequest("email-token"));

    await expect(response.json()).resolves.toEqual({
      success: false,
      status: "invalid",
      message: "Token invalido.",
    });
    expect(response.status).toBe(400);
  });

  it("returns 410 when token is expired", async () => {
    verifyEmailTokenMock.mockResolvedValue({
      status: "expired",
      message: "El link de confirmacion vencio.",
    });

    const response = await GET(createVerifyEmailRequest("email-token"));

    await expect(response.json()).resolves.toEqual({
      success: false,
      status: "expired",
      message: "El link de confirmacion vencio.",
    });
    expect(response.status).toBe(410);
  });
});
