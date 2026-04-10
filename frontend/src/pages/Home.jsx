import React from "react";

import { Link } from "react-router-dom";

import Button from "../components/ui/Button";

function Home() {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", background: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "48px", marginBottom: "20px", color: "#1f2937" }}>
        Nagendra Commerce
      </h1>
      <p style={{ fontSize: "20px", color: "#6b7280", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
        Separate customer shopping and admin operations in one app.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", maxWidth: "900px", margin: "0 auto 40px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#1f2937" }}>Customer Flow</h3>
          <p style={{ color: "#6b7280" }}>Browse products, manage cart, place orders</p>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#1f2937" }}>Admin Flow</h3>
          <p style={{ color: "#6b7280" }}>Create products, process orders, manage inventory</p>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#1f2937" }}>Security</h3>
          <p style={{ color: "#6b7280" }}>JWT login, registration, password reset</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <Button>Sign In</Button>
        </Link>
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <Button variant="secondary">Open Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
