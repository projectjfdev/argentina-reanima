import {
  createVerificationToken,
  hashVerificationToken,
} from "@/libs/auth/emailVerification";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/libs/db", () => ({
  prisma: {},
}));

describe("email verification token helpers", () => {
  it("creates hexadecimal tokens with 64 characters", () => {
    const token = createVerificationToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("creates different tokens on consecutive calls", () => {
    const firstToken = createVerificationToken();
    const secondToken = createVerificationToken();

    expect(secondToken).not.toBe(firstToken);
  });

  it("hashes tokens with deterministic SHA-256 output", () => {
    const token = "email-verification-token";

    expect(hashVerificationToken(token)).toBe(
      "99733c5e7e811c9496bce98ab56e775b891c27ddb509f00f000bb4bf478db406",
    );
    expect(hashVerificationToken(token)).toBe(hashVerificationToken(token));
    expect(hashVerificationToken(token)).toMatch(/^[a-f0-9]{64}$/);
  });
});
