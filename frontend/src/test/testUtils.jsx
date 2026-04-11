import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { render } from "@testing-library/react";

import theme from "../theme/theme";

export function renderWithTheme(ui, options) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, options);
}
