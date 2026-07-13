import { POST } from "@/app/api/auth/register/route";
import { hashVerificationToken } from "@/libs/auth/emailVerification";
import { linkCertificatesToUserByEmail } from "@/libs/certificates";
import { prisma } from "@/libs/db";
import { sendConfirmEmail } from "@/libs/email/resend";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const bcryptHashMock = vi.hoisted(() => vi.fn());

const txMock = vi.hoisted(() => ({
  emailVerificationToken: {
    create: vi.fn(),
  },
  user: {
    create: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: {
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/libs/db", () => ({
  prisma: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: bcryptHashMock,
  },
}));

vi.mock("@/libs/email/resend", () => ({
  sendConfirmEmail: vi.fn(),
}));

vi.mock("@/libs/certificates", () => ({
  linkCertificatesToUserByEmail: vi.fn(),
  normalizeCertificateEmail: (email: string) => email.trim().toLowerCase(),
}));

const sendConfirmEmailMock = vi.mocked(sendConfirmEmail);
const linkCertificatesToUserByEmailMock = vi.mocked(linkCertificatesToUserByEmail);

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

function validRegisterBody(overrides: Record<string, unknown> = {}) {
  return {
    name: "User",
    email: "user@example.com",
    password: "valid-password",
    ...overrides,
  };
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptHashMock.mockResolvedValue("hashed-password");
    txMock.user.create.mockResolvedValue({
      id: 10,
      name: "User",
      email: "user@example.com",
      role: "USER",
      emailVerified: null,
    });
    txMock.emailVerificationToken.create.mockResolvedValue({
      id: "verification-token-1",
    });
    linkCertificatesToUserByEmailMock.mockResolvedValue({ count: 0 });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );
    prismaMock.user.delete.mockResolvedValue({ id: 10 });
    sendConfirmEmailMock.mockResolvedValue(undefined);
  });

  it("returns 400 when name is missing", async () => {
    const response = await POST(createJsonRequest(validRegisterBody({ name: "" })));

    await expect(response.json()).resolves.toEqual({
      message: "El nombre es obligatorio",
      success: false,
    });
    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(
      createJsonRequest(validRegisterBody({ email: "invalid-email" })),
    );

    await expect(response.json()).resolves.toEqual({
      message: "El email no es valido",
      success: false,
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const response = await POST(
      createJsonRequest(validRegisterBody({ password: "short" })),
    );

    await expect(response.json()).resolves.toEqual({
      message: "La contraseña debe tener al menos 8 caracteres",
      success: false,
    });
    expect(response.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 10,
      email: "user@example.com",
    });

    const response = await POST(createJsonRequest(validRegisterBody()));

    await expect(response.json()).resolves.toEqual({
      message: "El email ya existe",
      success: false,
    });
    expect(response.status).toBe(409);
    expect(bcryptHashMock).not.toHaveBeenCalled();
  });

  it("creates user, verification token, links certificates and sends confirmation email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await POST(
      createJsonRequest(validRegisterBody({ email: " USER@EXAMPLE.COM " })),
    );

    const body = await response.json();
    const sentToken = sendConfirmEmailMock.mock.calls[0]?.[0].token;

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      success: true,
      user: {
        id: 10,
        name: "User",
        email: "user@example.com",
        role: "USER",
        emailVerified: null,
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
    expect(bcryptHashMock).toHaveBeenCalledWith("valid-password", 10);
    expect(txMock.user.create).toHaveBeenCalledWith({
      data: {
        name: "User",
        email: "user@example.com",
        password: "hashed-password",
        role: "USER",
        emailVerified: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });
    expect(txMock.emailVerificationToken.create).toHaveBeenCalledWith({
      data: {
        tokenHash: hashVerificationToken(sentToken),
        userId: 10,
        expiresAt: expect.any(Date),
      },
    });
    expect(linkCertificatesToUserByEmailMock).toHaveBeenCalledWith(
      txMock,
      10,
      "user@example.com",
    );
    expect(sendConfirmEmailMock).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "User",
      token: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(prisma).toBe(prismaMock);
    expect(bcrypt.hash).toBe(bcryptHashMock);
  });

  it("rolls back created user and returns 500 when confirmation email fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    prismaMock.user.findUnique.mockResolvedValue(null);
    sendConfirmEmailMock.mockRejectedValue(new Error("email failed"));

    const response = await POST(createJsonRequest(validRegisterBody()));

    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
      success: false,
    });
    expect(response.status).toBe(500);
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 10 },
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error in /api/auth/register:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
