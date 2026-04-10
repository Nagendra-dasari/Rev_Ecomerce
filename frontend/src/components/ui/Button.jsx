import React from "react";

function Button({ children, className = "", variant = "primary", style = {}, ...props }) {
  const baseStyles = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s",
  };

  const variantStyles = {
    primary: {
      background: "#3b82f6",
      color: "white",
    },
    secondary: {
      background: "white",
      color: "#3b82f6",
      border: "1px solid #3b82f6",
    },
    ghost: {
      background: "transparent",
      color: "#3b82f6",
      border: "none",
    },
  };

  const buttonStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button style={buttonStyle} {...props}>
      {children}
    </button>
  );
}

export default Button;
