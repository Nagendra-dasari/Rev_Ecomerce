import React from "react";
import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button component", () => {
  test("renders with default primary style and children", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Click me");
    expect(button).toHaveStyle({ background: "#3b82f6", color: "white" });
  });

  test("applies secondary variant style when requested", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ background: "white", color: "#3b82f6" });
  });

  test("applies ghost variant style when requested", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ background: "transparent", color: "#3b82f6" });
  });
});
