import React from "react";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { renderWithTheme } from "../test/testUtils";
import Home from "./Home";

describe("Home page", () => {
  test("renders hero text and links", () => {
    renderWithTheme(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Nagendra Commerce/)).toBeInTheDocument();
    expect(screen.getByText(/Sign In/)).toBeInTheDocument();
    expect(screen.getByText(/Open Dashboard/)).toBeInTheDocument();
  });
});
