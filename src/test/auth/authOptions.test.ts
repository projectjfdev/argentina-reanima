import { authOptions } from "@/libs/authOptions";
import { linkCertificatesToUserByEmail } from "@/libs/certificates";
import { prisma } from "@/libs/db";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const bcryptCompareMock = vi.hoisted(() => vi.fn());

const txMock = vi.hoisted(() => ({
  user: {
    create: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/libs/db", () => ({
  prisma: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: bcryptCompareMock,
  },
}));

vi.mock("@/libs/certificates", () => ({
  linkCertificatesToUserByEmail: vi.fn(),
  normalizeCertificateEmail: (email: string) => email.trim().toLowerCase(),
}));

const linkCertificatesToUserByEmailMock = vi.mocked(linkCertificatesToUserByEmail);

function getCredentialsAuthorize() {
  const provider = authOptions.providers.find(
    (currentProvider) => currentProvider.id === "credentials",
  );

  if (!provider || !("options" in provider)) {
    throw new Error("Credentials provider authorize callback not found");
  }

  const options = provider.options as {
    authorize?: (
      credentials?: { email?: string; password?: string },
      request?: unknown,
    ) => Promise<unknown>;
  };

  if (!options.authorize) {
    throw new Error("Credentials provider authorize callback not found");
  }

  return options.authorize as (
    credentials?: { email?: string; password?: string },
    request?: unknown,
  ) => Promise<unknown>;
}

function getCallback(name: "jwt" | "session" | "signIn") {
  const callback = authOptions.callbacks?.[name];

  if (!callback) {
    throw new Error(`${name} callback not found`);
  }

  return callback as (...args: any[]) => Promise<any>;
}

describe("authOptions credentials authorize", () => {
  const authorize = getCredentialsAuthorize();
  const verifiedAt = new Date("2026-01-01T00:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
    bcryptCompareMock.mockResolvedValue(true);
  });

  it("throws when credentials are missing", async () => {
    await expect(authorize(undefined)).rejects.toThrow(
      "Email and password are required",
    );
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("throws when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      authorize({ email: " USER@EXAMPLE.COM ", password: "password" }),
    ).rejects.toThrow("El usuario no existe");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
  });

  it("throws when user has no local password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "User",
      email: "user@example.com",
      password: null,
      role: "USER",
      emailVerified: verifiedAt,
    });

    await expect(
      authorize({ email: "user@example.com", password: "password" }),
    ).rejects.toThrow("Esta cuenta no tiene contraseña local.");
  });

  it("throws when email is not verified", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "User",
      email: "user@example.com",
      password: "hashed-password",
      role: "USER",
      emailVerified: null,
    });

    await expect(
      authorize({ email: "user@example.com", password: "password" }),
    ).rejects.toThrow("Tenés que confirmar tu email");
  });

  it("throws when password does not match", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "User",
      email: "user@example.com",
      password: "hashed-password",
      role: "USER",
      emailVerified: verifiedAt,
    });
    bcryptCompareMock.mockResolvedValue(false);

    await expect(
      authorize({ email: "user@example.com", password: "wrong-password" }),
    ).rejects.toThrow("Contraseña incorrecta");
  });

  it("returns the authenticated user when credentials are valid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "User",
      email: "user@example.com",
      password: "hashed-password",
      role: "USER",
      emailVerified: verifiedAt,
    });

    await expect(
      authorize({ email: "user@example.com", password: "password" }),
    ).resolves.toEqual({
      id: "1",
      name: "User",
      email: "user@example.com",
      role: "USER",
      emailVerified: verifiedAt,
    });
    expect(bcrypt.compare).toBe(bcryptCompareMock);
    expect(bcryptCompareMock).toHaveBeenCalledWith("password", "hashed-password");
  });
});

describe("authOptions signIn callback", () => {
  const signIn = getCallback("signIn");

  beforeEach(() => {
    vi.clearAllMocks();
    linkCertificatesToUserByEmailMock.mockResolvedValue({ count: 0 });
    txMock.user.create.mockResolvedValue({
      id: 20,
      name: "Google User",
      email: "google@example.com",
      role: "USER",
      emailVerified: null,
    });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );
  });

  it("allows non-Google providers", async () => {
    await expect(
      signIn({
        user: { email: "user@example.com" },
        account: { provider: "credentials" },
        profile: undefined,
      }),
    ).resolves.toBe(true);

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects Google sign in when email is missing", async () => {
    await expect(
      signIn({
        user: {},
        account: { provider: "google" },
        profile: { email_verified: true },
      }),
    ).resolves.toBe(false);

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("links existing Google users and updates email verification when needed", async () => {
    const user = {
      email: " GOOGLE@EXAMPLE.COM ",
      name: "Google Profile",
    } as any;

    prismaMock.user.findUnique.mockResolvedValue({
      id: 10,
      name: "Existing User",
      email: "google@example.com",
      role: "USER",
      emailVerified: null,
    });
    prismaMock.user.update.mockResolvedValue({
      id: 10,
      name: "Existing User",
      email: "google@example.com",
      role: "USER",
      emailVerified: new Date("2026-01-01T00:00:00.000Z"),
    });

    await expect(
      signIn({
        user,
        account: { provider: "google" },
        profile: { email_verified: true },
      }),
    ).resolves.toBe(true);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "google@example.com" },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { emailVerified: expect.any(Date) },
    });
    expect(linkCertificatesToUserByEmailMock).toHaveBeenCalledWith(
      prisma,
      10,
      "google@example.com",
    );
    expect(user).toMatchObject({
      id: "10",
      name: "Existing User",
      email: "google@example.com",
      role: "USER",
    });
    expect(user.emailVerified).toEqual(new Date("2026-01-01T00:00:00.000Z"));
  });

  it("creates a user for new Google accounts and links certificates", async () => {
    const user = {
      email: "new-google@example.com",
      name: "New Google",
    } as any;

    prismaMock.user.findUnique.mockResolvedValue(null);
    txMock.user.create.mockResolvedValue({
      id: 30,
      name: "New Google",
      email: "new-google@example.com",
      role: "USER",
      emailVerified: new Date("2026-01-01T00:00:00.000Z"),
    });

    await expect(
      signIn({
        user,
        account: { provider: "google" },
        profile: { email_verified: true },
      }),
    ).resolves.toBe(true);

    expect(txMock.user.create).toHaveBeenCalledWith({
      data: {
        name: "New Google",
        email: "new-google@example.com",
        password: null,
        role: "USER",
        emailVerified: expect.any(Date),
      },
    });
    expect(linkCertificatesToUserByEmailMock).toHaveBeenCalledWith(
      txMock,
      30,
      "new-google@example.com",
    );
    expect(user).toMatchObject({
      id: "30",
      name: "New Google",
      email: "new-google@example.com",
      role: "USER",
    });
  });
});

describe("authOptions jwt callback", () => {
  const jwt = getCallback("jwt");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("copies user fields into token and refreshes them from database", async () => {
    const emailVerified = new Date("2026-01-01T00:00:00.000Z");
    prismaMock.user.findUnique.mockResolvedValue({
      id: 99,
      role: "ADMIN",
      emailVerified,
    });

    const token = await jwt({
      token: { email: "admin@example.com" },
      user: {
        id: "1",
        role: "USER",
        emailVerified: new Date("2025-01-01T00:00:00.000Z"),
      },
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      select: {
        id: true,
        role: true,
        emailVerified: true,
      },
    });
    expect(token).toMatchObject({
      id: "99",
      role: "ADMIN",
      emailVerified: emailVerified.toISOString(),
    });
  });

  it("keeps token values when database user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const token = await jwt({
      token: { email: "missing@example.com", id: "1", role: "USER" },
      user: undefined,
    });

    expect(token).toMatchObject({
      id: "1",
      role: "USER",
    });
  });
});

describe("authOptions session callback", () => {
  const session = getCallback("session");

  it("copies token fields into session user", async () => {
    const result = await session({
      session: {
        user: {
          name: "User",
          email: "user@example.com",
          image: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
      },
      token: {
        id: "10",
        role: "ADMIN",
        emailVerified: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(result.user).toMatchObject({
      name: "User",
      email: "user@example.com",
      id: "10",
      role: "ADMIN",
      emailVerified: "2026-01-01T00:00:00.000Z",
    });
  });
});
