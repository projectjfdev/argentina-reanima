import { resetPasswordWithToken } from "@/libs/auth/passwordReset";
import { POST } from "@/app/api/auth/reset-password/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/libs/auth/passwordReset", () => ({
  resetPasswordWithToken: vi.fn(),
}));

const resetPasswordWithTokenMock = vi.mocked(resetPasswordWithToken);

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when password is too short", async () => {
    const response = await POST(
      createJsonRequest({ token: "reset-token", password: "short" }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "La contraseña debe tener al menos 8 caracteres",
      success: false,
    });
    expect(response.status).toBe(400);
    expect(resetPasswordWithTokenMock).not.toHaveBeenCalled();
  });

  it("returns 400 when helper result is not successful", async () => {
    resetPasswordWithTokenMock.mockResolvedValue({
      status: "invalid",
      message: "El link de recuperacion no es valido.",
    });

    const response = await POST(
      createJsonRequest({ token: "reset-token", password: "valid-password" }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "El link de recuperacion no es valido.",
      success: false,
    });
    expect(response.status).toBe(400);
    expect(resetPasswordWithTokenMock).toHaveBeenCalledWith({
      token: "reset-token",
      password: "valid-password",
    });
  });

  it("returns success true when helper result is successful", async () => {
    resetPasswordWithTokenMock.mockResolvedValue({
      status: "success",
      message: "Tu contrasena fue actualizada correctamente.",
    });

    const response = await POST(
      createJsonRequest({ token: "reset-token", password: "valid-password" }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Tu contrasena fue actualizada correctamente.",
      success: true,
    });
    expect(response.status).toBe(200);
    expect(resetPasswordWithTokenMock).toHaveBeenCalledWith({
      token: "reset-token",
      password: "valid-password",
    });
  });
});
