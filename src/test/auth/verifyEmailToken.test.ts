import {
  hashVerificationToken,
  verifyEmailToken,
} from "@/libs/auth/emailVerification";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  emailVerificationToken: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
}));

vi.mock("@/libs/db", () => ({
  prisma: prismaMock,
}));

const validToken = "valid-email-token";
const futureDate = new Date("2099-01-01T00:00:00.000Z");
const pastDate = new Date("2000-01-01T00:00:00.000Z");

function createVerificationTokenRecord(
  overrides: Partial<{
    id: string;
    userId: string;
    usedAt: Date | null;
    expiresAt: Date;
    user: {
      emailVerified: Date | null;
    };
  }> = {},
) {
  return {
    id: "verification-token-1",
    userId: "user-1",
    usedAt: null,
    expiresAt: futureDate,
    user: {
      emailVerified: null,
    },
    ...overrides,
  };
}

describe("verifyEmailToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockResolvedValue(undefined);
    prismaMock.user.update.mockResolvedValue({ id: "user-1" });
    prismaMock.emailVerificationToken.update.mockResolvedValue({
      id: "verification-token-1",
    });
  });

  it("returns invalid when token is empty", async () => {
    await expect(verifyEmailToken("")).resolves.toMatchObject({
      status: "invalid",
    });

    expect(prismaMock.emailVerificationToken.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns invalid when token does not exist", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);

    await expect(verifyEmailToken(validToken)).resolves.toMatchObject({
      status: "invalid",
    });

    expect(prismaMock.emailVerificationToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashVerificationToken(validToken) },
      include: { user: true },
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns already-verified when user email is already verified", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(
      createVerificationTokenRecord({
        user: {
          emailVerified: new Date("2026-01-01T00:00:00.000Z"),
        },
      }),
    );

    await expect(verifyEmailToken(validToken)).resolves.toMatchObject({
      status: "already-verified",
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns invalid when token was already used", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(
      createVerificationTokenRecord({
        usedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
    );

    await expect(verifyEmailToken(validToken)).resolves.toMatchObject({
      status: "invalid",
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns expired when token expired", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(
      createVerificationTokenRecord({
        expiresAt: pastDate,
      }),
    );

    await expect(verifyEmailToken(validToken)).resolves.toMatchObject({
      status: "expired",
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("updates user and token when token is valid", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(
      createVerificationTokenRecord(),
    );

    await expect(verifyEmailToken(validToken)).resolves.toMatchObject({
      status: "success",
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { emailVerified: expect.any(Date) },
    });
    expect(prismaMock.emailVerificationToken.update).toHaveBeenCalledWith({
      where: { id: "verification-token-1" },
      data: { usedAt: expect.any(Date) },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });
});
