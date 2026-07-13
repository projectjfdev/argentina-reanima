import { SignOutMenuButton } from "@/components/Buttons/SignOutMenuButton";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOut } from "next-auth/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

const signOutMock = vi.mocked(signOut);

describe("SignOutMenuButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the sign out button", () => {
    render(<SignOutMenuButton />);

    expect(
      screen.getByRole("button", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();
  });

  it("calls signOut with home callback URL when clicked", async () => {
    const user = userEvent.setup();

    render(<SignOutMenuButton />);

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
