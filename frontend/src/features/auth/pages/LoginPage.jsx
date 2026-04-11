import React, { useState } from "react";

import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

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

  const modeLabel =
    mode === "login"
      ? "Welcome back"
      : mode === "register"
        ? "Create account"
        : mode === "reset-request"
          ? "Generate reset token"
          : "Set new password";

  return (
    <Box sx={{ bgcolor: "grey.50", py: { xs: 3, md: 5 }, flex: 1 }}>
      <Grid container spacing={3} sx={{ maxWidth: 1100, mx: "auto", px: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography color="primary" sx={{ fontWeight: 600, mb: 1 }} variant="overline">
              Account Access
            </Typography>
            <Typography gutterBottom variant="h4">
              Sign in, register, or reset your password.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }} variant="body1">
              This project now exposes customer and admin flows from one account system, including addresses, wishlist,
              orders, and notifications.
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              onChange={(_, value) => value && switchMode(value)}
              orientation="horizontal"
              size="small"
              sx={{ flexWrap: "wrap", mt: 2 }}
              value={mode.startsWith("reset") ? "reset-request" : mode}
            >
              <ToggleButton value="login">Login</ToggleButton>
              <ToggleButton value="register">Register</ToggleButton>
              <ToggleButton value="reset-request">Password Reset</ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper component="form" elevation={2} onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography gutterBottom variant="h5">
              {modeLabel}
            </Typography>
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
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel id="role-label">Account type</InputLabel>
                  <Select
                    id="role"
                    label="Account type"
                    labelId="role-label"
                    value={registerForm.role}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
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
            {error ? (
              <Typography color="error" sx={{ mt: 1 }} variant="body2">
                {error}
              </Typography>
            ) : null}
            {resetMessage ? (
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                {resetMessage}
              </Typography>
            ) : null}
            {resetToken && mode === "reset-request" ? (
              <Typography sx={{ mt: 1 }} variant="body2">
                Token: {resetToken}
              </Typography>
            ) : null}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
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
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default LoginPage;
