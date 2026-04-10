import React, { useState } from "react";

import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import {
  clearResetState,
  confirmResetPassword,
  loginUser,
  registerUser,
  requestResetToken,
} from "../authSlice";

const initialRegister = { name: "", email: "", password: "", phone: "", role: "customer" };
const initialLogin = { email: "", password: "" };
const initialReset = { email: "", token: "", password: "" };

function LoginPage() {
  const dispatch = useDispatch();
  const { user, error, status, resetToken, resetMessage } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [resetForm, setResetForm] = useState(initialReset);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    dispatch(clearResetState());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === "login") {
      dispatch(loginUser(loginForm));
      return;
    }
    if (mode === "register") {
      dispatch(registerUser(registerForm));
      return;
    }
    if (mode === "reset-request") {
      const result = await dispatch(requestResetToken({ email: resetForm.email }));
      if (result.meta.requestStatus === "fulfilled") {
        setResetForm((current) => ({ ...current, token: result.payload.reset_token }));
      }
      return;
    }
    dispatch(confirmResetPassword({ token: resetForm.token, password: resetForm.password }));
  };

  return (
    <div className="page auth-grid">
      <section className="hero-card">
        <span className="tag">Account Access</span>
        <h1 className="hero-title">Sign in, register, or reset your password.</h1>
        <p className="hero-subtitle">
          This project now exposes customer and admin flows from one account system, including addresses, wishlist, orders,
          and notifications.
        </p>
        <div className="chip-row" style={{ marginTop: 20 }}>
          <button className={`chip ${mode === "login" ? "chip-active" : ""}`} onClick={() => switchMode("login")} type="button">
            Login
          </button>
          <button className={`chip ${mode === "register" ? "chip-active" : ""}`} onClick={() => switchMode("register")} type="button">
            Register
          </button>
          <button
            className={`chip ${mode.startsWith("reset") ? "chip-active" : ""}`}
            onClick={() => switchMode("reset-request")}
            type="button"
          >
            Password Reset
          </button>
        </div>
      </section>
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>
          {mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : mode === "reset-request" ? "Generate reset token" : "Set new password"}
        </h2>
        {mode === "login" ? (
          <>
            <Input
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
            />
          </>
        ) : null}
        {mode === "register" ? (
          <>
            <label className="input-group">
              <span>Account type</span>
              <select
                className="input"
                value={registerForm.role}
                onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <Input
              label="Full name"
              value={registerForm.name}
              onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              label="Phone"
              value={registerForm.phone}
              onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
            />
          </>
        ) : null}
        {mode === "reset-request" ? (
          <Input
            label="Account email"
            type="email"
            value={resetForm.email}
            onChange={(event) => setResetForm((current) => ({ ...current, email: event.target.value }))}
          />
        ) : null}
        {mode === "reset-confirm" ? (
          <>
            <Input
              label="Reset token"
              value={resetForm.token}
              onChange={(event) => setResetForm((current) => ({ ...current, token: event.target.value }))}
            />
            <Input
              label="New password"
              type="password"
              value={resetForm.password}
              onChange={(event) => setResetForm((current) => ({ ...current, password: event.target.value }))}
            />
          </>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        {resetMessage ? <p className="muted">{resetMessage}</p> : null}
        {resetToken && mode === "reset-request" ? <p className="chip">Token: {resetToken}</p> : null}
        <div className="chip-row" style={{ marginTop: 12 }}>
          <Button disabled={status === "loading"} type="submit">
            {status === "loading"
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : mode === "register"
                  ? "Register"
                  : mode === "reset-request"
                    ? "Generate token"
                    : "Update password"}
          </Button>
          {mode === "reset-request" ? (
            <Button type="button" variant="secondary" onClick={() => setMode("reset-confirm")}>
              I already have a token
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
