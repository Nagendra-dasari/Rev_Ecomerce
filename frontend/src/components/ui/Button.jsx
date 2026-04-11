import React from "react";
import MuiButton from "@mui/material/Button";

function Button({ children, className = "", variant = "primary", style = {}, sx = {}, ...props }) {
  const muiVariant =
    variant === "secondary" ? "outlined" : variant === "ghost" ? "text" : "contained";
  const color = "primary";

  return (
    <MuiButton
      className={className}
      color={color}
      sx={{ ...style, ...sx }}
      variant={muiVariant}
      {...props}
    >
      {children}
    </MuiButton>
  );
}

export default Button;
