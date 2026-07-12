import { cn } from "@/libs/utils";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

function CounterButton() {
  const [count, setCount] = useState<number>(0);

  return (
    <button
      className={cn("rounded", count > 0 && "active")}
      onClick={() => setCount((currentCount) => currentCount + 1)}
      type="button"
    >
      Count: {count}
    </button>
  );
}

describe("test environment", () => {
  it("renders React, uses jest-dom matchers, resolves aliases and handles user interactions", async () => {
    const user = userEvent.setup();

    render(<CounterButton />);

    const button = screen.getByRole("button", { name: "Count: 0" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("rounded");

    await user.click(button);

    expect(button).toHaveTextContent("Count: 1");
    expect(button).toHaveClass("active");
  });
});
