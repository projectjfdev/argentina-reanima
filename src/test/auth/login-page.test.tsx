import LoginPage from "@/app/(front)/auth/login/page";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

vi.mock("@/components/Login/AuthVisualPanel", () => ({
  AuthVisualPanel: () => <div data-testid="auth-visual-panel" />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      onHoverEnd: _onHoverEnd,
      onHoverStart: _onHoverStart,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      onHoverEnd?: unknown;
      onHoverStart?: unknown;
      whileHover?: unknown;
      whileTap?: unknown;
    }) => <div {...props}>{children}</div>,
    span: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}));

vi.mock("next-auth/react", () => ({
  getSession: vi.fn(),
  signIn: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const getSessionMock = vi.mocked(getSession);
const signInMock = vi.mocked(signIn);
const useSessionMock = vi.mocked(useSession);
const useRouterMock = vi.mocked(useRouter);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue(null);
    signInMock.mockResolvedValue(undefined);
    updateMock.mockResolvedValue(undefined);
    useSessionMock.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: updateMock,
    });
    useRouterMock.mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: pushMock,
      refresh: refreshMock,
      replace: vi.fn(),
    });
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continuar con google/i }),
    ).toBeInTheDocument();
  });

  it("validates required email and password fields", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      await screen.findByText("El correo de administrador es requerido"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Por favor, ingrese su contraseña"),
    ).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("submits credentials with redirect disabled", async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true, status: 200, error: null, url: null });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "valid-password");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("credentials", {
        email: "user@example.com",
        password: "valid-password",
        redirect: false,
      });
    });
  });

  it("shows credential errors returned by signIn", async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({
      ok: false,
      status: 401,
      error: "Contraseña incorrecta",
      url: null,
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Contraseña incorrecta")).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("updates session and redirects admins to dashboard after successful login", async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true, status: 200, error: null, url: null });
    getSessionMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        user: {
          id: "admin-1",
          name: "Admin",
          email: "admin@example.com",
          role: "ADMIN",
          emailVerified: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "valid-password");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(1);
      expect(refreshMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("updates session and redirects users home after successful login", async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true, status: 200, error: null, url: null });
    getSessionMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        user: {
          id: "user-1",
          name: "User",
          email: "user@example.com",
          role: "USER",
          emailVerified: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "valid-password");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(1);
      expect(refreshMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("starts Google sign in with login callback URL", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /continuar con google/i }));

    expect(signInMock).toHaveBeenCalledWith("google", {
      callbackUrl: "/auth/login",
    });
  });
});
