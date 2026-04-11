import React from "react";
import TextField from "@mui/material/TextField";

function Input({ label, error, multiline, rows, minRows, ...props }) {
  return (
    <TextField
      error={Boolean(error)}
      fullWidth
      helperText={error || undefined}
      label={label || undefined}
      margin="normal"
      multiline={Boolean(multiline)}
      rows={rows}
      minRows={minRows}
      size="small"
      variant="outlined"
      {...props}
    />
  );
}

export default Input;
