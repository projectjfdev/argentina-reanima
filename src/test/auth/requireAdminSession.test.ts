import { requireAdminSession } from "@/libs/auth/requireAdminSession";
import { getServerSession } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/libs/authOptions", () => ({
  authOptions: {},
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

const getServerSessionMock = vi.mocked(getServerSession);

describe("requireAdminSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no session", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await requireAdminSession();

    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      error: "No autenticado",
      success: false,
    });
  });

  it("returns 403 when the session user is not an admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
        name: "User",
        email: "user@example.com",
        role: "USER",
        emailVerified: null,
      },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const response = await requireAdminSession();

    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({
      error: "No autorizado",
      success: false,
    });
  });

  it("returns null when the session user is an admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "admin-1",
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
        emailVerified: null,
      },
      expires: "2099-01-01T00:00:00.000Z",
    });

    await expect(requireAdminSession()).resolves.toBeNull();
  });
});
