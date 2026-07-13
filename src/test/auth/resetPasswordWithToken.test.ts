import {
  hashPasswordResetToken,
  resetPasswordWithToken,
} from "@/libs/auth/passwordReset";
import { beforeEach, describe, expect, it, vi } from "vitest";

const bcryptHashMock = vi.hoisted(() => vi.fn());

const txMock = vi.hoisted(() => ({
  passwordResetToken: {
    updateMany: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  passwordResetToken: {
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

const validToken = "valid-password-token";
const validPassword = "new-password";
const futureDate = new Date("2099-01-01T00:00:00.000Z");
const pastDate = new Date("2000-01-01T00:00:00.000Z");

function createPasswordResetTokenRecord(
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
    id: "password-reset-token-1",
    userId: "user-1",
    usedAt: null,
    expiresAt: futureDate,
    user: {
      emailVerified: null,
    },
    ...overrides,
  };
}

describe("resetPasswordWithToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptHashMock.mockResolvedValue("hashed-password");
    txMock.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    txMock.user.update.mockResolvedValue({ id: "user-1" });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );
  });

  it("returns invalid when token is empty", async () => {
    await expect(
      resetPasswordWithToken({ token: "", password: validPassword }),
    ).resolves.toMatchObject({
      status: "invalid",
    });

    expect(prismaMock.passwordResetToken.findUnique).not.toHaveBeenCalled();
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns invalid when token does not exist", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);

    await expect(
      resetPasswordWithToken({ token: validToken, password: validPassword }),
    ).resolves.toMatchObject({
      status: "invalid",
    });

    expect(prismaMock.passwordResetToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashPasswordResetToken(validToken) },
      include: { user: true },
    });
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns invalid when token was already used", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(
      createPasswordResetTokenRecord({
        usedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
    );

    await expect(
      resetPasswordWithToken({ token: validToken, password: validPassword }),
    ).resolves.toMatchObject({
      status: "invalid",
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns expired when token expired", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(
      createPasswordResetTokenRecord({
        expiresAt: pastDate,
      }),
    );

    await expect(
      resetPasswordWithToken({ token: validToken, password: validPassword }),
    ).resolves.toMatchObject({
      status: "expired",
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("updates password, consumes token and invalidates other tokens on success", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(
      createPasswordResetTokenRecord(),
    );

    await expect(
      resetPasswordWithToken({ token: validToken, password: validPassword }),
    ).resolves.toMatchObject({
      status: "success",
    });

    expect(bcryptHashMock).toHaveBeenCalledWith(validPassword, 10);
    expect(txMock.passwordResetToken.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: "password-reset-token-1",
        usedAt: null,
      },
      data: { usedAt: expect.any(Date) },
    });
    expect(txMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        password: "hashed-password",
        emailVerified: expect.any(Date),
      },
    });
    expect(txMock.passwordResetToken.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        userId: "user-1",
        usedAt: null,
        id: { not: "password-reset-token-1" },
      },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("keeps existing email verification date when updating password", async () => {
    const emailVerified = new Date("2026-01-01T00:00:00.000Z");
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(
      createPasswordResetTokenRecord({
        user: { emailVerified },
      }),
    );

    await resetPasswordWithToken({
      token: validToken,
      password: validPassword,
    });

    expect(txMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        password: "hashed-password",
        emailVerified,
      },
    });
  });

  it("returns invalid when token cannot be consumed inside transaction", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(
      createPasswordResetTokenRecord(),
    );
    txMock.passwordResetToken.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      resetPasswordWithToken({ token: validToken, password: validPassword }),
    ).resolves.toMatchObject({
      status: "invalid",
    });

    expect(bcryptHashMock).toHaveBeenCalledWith(validPassword, 10);
    expect(txMock.user.update).not.toHaveBeenCalled();
    expect(txMock.passwordResetToken.updateMany).toHaveBeenCalledTimes(1);
  });
});
