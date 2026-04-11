import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import { store } from "./store/store";
import theme from "./theme/theme";
import "./index.css";

globalThis.__APP_CONFIG__ = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
);
