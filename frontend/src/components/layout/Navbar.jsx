import React from "react";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../ui/Button";
import { logout } from "../../features/auth/authSlice";
import { resetCart } from "../../store/cartSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate("/");
  };

  return (
    <header style={{ borderBottom: "1px solid #dbe1ea", background: "#ffffff", padding: "16px 0" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          {user ? (
            <strong style={{ fontSize: "18px" }}>Nagendra Commerce</strong>
          ) : (
            <Link to="/" style={{ textDecoration: "none" }}>
              <strong style={{ fontSize: "18px" }}>Nagendra Commerce</strong>
            </Link>
          )}
        </div>
        <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>{user.name}</span>
              <Button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <span style={{ padding: "8px 12px", borderRadius: "999px", background: "#eef2ff", color: "#334155", fontSize: "14px", display: "inline-block" }}>
                  Home
                </span>
              </Link>
              <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
                <span style={{ padding: "8px 12px", borderRadius: "999px", background: "#eef2ff", color: "#334155", fontSize: "14px", display: "inline-block" }}>
                  Login
                </span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
