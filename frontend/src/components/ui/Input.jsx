import React from "react";

function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label ? (
        <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
          {label}
        </label>
      ) : null}
      <input
        {...props}
        style={{
          width: "100%",
          padding: "10px",
          border: error ? "1px solid #dc2626" : "1px solid #ddd",
          borderRadius: "6px",
          boxSizing: "border-box",
          fontSize: "16px",
        }}
      />
      {error ? <span style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px", display: "block" }}>{error}</span> : null}
    </div>
  );
}

export default Input;
