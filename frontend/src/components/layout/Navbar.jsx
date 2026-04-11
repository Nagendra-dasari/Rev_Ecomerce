import React from "react";

import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

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
    <AppBar color="inherit" elevation={1} position="sticky" sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, sm: 3 } }}>
        <Typography component="div" sx={{ flexGrow: 1, fontWeight: 700 }} variant="h6">
          {user ? (
            "Nagendra Commerce"
          ) : (
            <Button color="inherit" component={RouterLink} sx={{ fontWeight: 700, fontSize: "1.25rem" }} to="/">
              Nagendra Commerce
            </Button>
          )}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {user ? (
            <>
              <Typography color="text.secondary" variant="body2">
                {user.name}
              </Typography>
              <Button color="primary" onClick={handleLogout} variant="outlined">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="primary" component={RouterLink} to="/" variant="text">
                Home
              </Button>
              <Button color="primary" component={RouterLink} to="/login" variant="contained">
                Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
