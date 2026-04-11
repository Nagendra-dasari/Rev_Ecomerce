import React from "react";
import { screen } from "@testing-library/react";

import { renderWithTheme } from "../../test/testUtils";
import Button from "./Button";

describe("Button component", () => {
  test("renders with default primary style and children", () => {
    renderWithTheme(<Button>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Click me");
    expect(button.className).toMatch(/MuiButton-contained/);
  });

  test("applies secondary variant style when requested", () => {
    renderWithTheme(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toMatch(/MuiButton-outlined/);
  });

  test("applies ghost variant style when requested", () => {
    renderWithTheme(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toMatch(/MuiButton-text/);
  });
});
