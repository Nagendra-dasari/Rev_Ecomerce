import React from "react";
import Box from "@mui/material/Box";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppRoutes />
    </Box>
  );
}

export default App;
