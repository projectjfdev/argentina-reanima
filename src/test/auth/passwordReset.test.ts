import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "@/libs/auth/passwordReset";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/libs/db", () => ({
  prisma: {},
}));

describe("password reset token helpers", () => {
  it("creates hexadecimal tokens with 64 characters", () => {
    const token = createPasswordResetToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("creates different tokens on consecutive calls", () => {
    const firstToken = createPasswordResetToken();
    const secondToken = createPasswordResetToken();

    expect(secondToken).not.toBe(firstToken);
  });

  it("hashes tokens with deterministic SHA-256 output", () => {
    const token = "password-reset-token";

    expect(hashPasswordResetToken(token)).toBe(
      "28a0861a36e29ed3dc289850a913d0843f694bd401cdf5c95130b3604e562204",
    );
    expect(hashPasswordResetToken(token)).toBe(hashPasswordResetToken(token));
    expect(hashPasswordResetToken(token)).toMatch(/^[a-f0-9]{64}$/);
  });
});
