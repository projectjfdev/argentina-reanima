import { POST } from "@/app/api/auth/forgot-password/route";
import { hashPasswordResetToken } from "@/libs/auth/passwordReset";
import { prisma } from "@/libs/db";
import { sendPasswordResetEmail } from "@/libs/email/resend";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  passwordResetToken: {
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/libs/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/libs/email/resend", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const sendPasswordResetEmailMock = vi.mocked(sendPasswordResetEmail);

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockResolvedValue(undefined);
    prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.passwordResetToken.create.mockResolvedValue({
      id: "reset-token-1",
    });
    sendPasswordResetEmailMock.mockResolvedValue(undefined);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(createJsonRequest({ email: "invalid-email" }));

    await expect(response.json()).resolves.toMatchObject({
      message: "Ingresa un email valido",
      success: false,
    });
    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns a generic success response when email does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await POST(
      createJsonRequest({ email: "missing@example.com" }),
    );

    await expect(response.json()).resolves.toMatchObject({
      success: true,
    });
    expect(response.status).toBe(200);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "missing@example.com" },
      select: { id: true, email: true, name: true },
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it("invalidates previous tokens, creates a token and sends email for existing users", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 10,
      email: "user@example.com",
      name: "User",
    });

    const response = await POST(
      createJsonRequest({ email: " USER@EXAMPLE.COM " }),
    );

    const body = await response.json();
    const sentToken = sendPasswordResetEmailMock.mock.calls[0]?.[0].token;

    expect(body).toMatchObject({ success: true });
    expect(response.status).toBe(200);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      select: { id: true, email: true, name: true },
    });
    expect(prismaMock.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 10,
        usedAt: null,
      },
      data: { usedAt: expect.any(Date) },
    });
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        tokenHash: hashPasswordResetToken(sentToken),
        userId: 10,
        expiresAt: expect.any(Date),
      },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      prismaMock.passwordResetToken.updateMany.mock.results[0].value,
      prismaMock.passwordResetToken.create.mock.results[0].value,
    ]);
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "User",
      token: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(prisma).toBe(prismaMock);
  });

  it("does not leak information when sending reset email fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    prismaMock.user.findUnique.mockResolvedValue({
      id: 10,
      email: "user@example.com",
      name: "User",
    });
    sendPasswordResetEmailMock.mockRejectedValue(new Error("email failed"));

    const response = await POST(createJsonRequest({ email: "user@example.com" }));

    await expect(response.json()).resolves.toMatchObject({
      success: true,
    });
    expect(response.status).toBe(200);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error sending password reset email:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
