import React, { useEffect, useState } from "react";

import { Link as RouterLink, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import MuiLink from "@mui/material/Link";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Button from "../components/ui/Button";
import { setCart } from "../store/cartSlice";
import { formatCurrency } from "../utils/currency";
import { normalizeApiError } from "../utils/apiError";
import { clearCartApi, getCart, removeCartItem, updateCartItem } from "../services/storeApi";

function Cart() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) {
        return;
      }
      try {
        const data = await getCart();
        if (!ignore) {
          dispatch(setCart(data));
        }
      } catch (apiError) {
        if (!ignore) {
          setError(normalizeApiError(apiError, "Unable to load cart"));
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [dispatch, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const changeQuantity = async (productId, quantity) => {
    try {
      const data = await updateCartItem(productId, quantity);
      dispatch(setCart(data));
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to update cart"));
    }
  };

  const removeItem = async (productId) => {
    try {
      const data = await removeCartItem(productId);
      dispatch(setCart(data));
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to remove item"));
    }
  };

  const clearAll = async () => {
    try {
      const data = await clearCartApi();
      dispatch(setCart(data));
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to clear cart"));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
      <Card sx={{ mb: 3 }} variant="outlined">
        <CardContent>
          <Stack alignItems={{ xs: "flex-start", sm: "center" }} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Chip label="Cart" size="small" sx={{ mb: 1 }} />
              <Typography gutterBottom variant="h4">
                Persistent shopping cart
              </Typography>
              <Typography color="text.secondary">
                Your cart is saved on the backend, so it survives refreshes and new sessions.
              </Typography>
            </Box>
            <Button variant="ghost" onClick={clearAll}>
              Clear cart
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {error ? (
        <Typography color="error" sx={{ mb: 2 }} variant="body2">
          {error}
        </Typography>
      ) : null}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {cart.items.map((item) => (
              <Card key={item.product_id} variant="outlined">
                <CardContent>
                  <Stack alignItems={{ xs: "flex-start", sm: "center" }} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <MuiLink component={RouterLink} to={`/products/${item.product_id}`} underline="hover" variant="h6">
                        {item.name}
                      </MuiLink>
                      <Typography color="text.secondary" variant="body2">
                        {formatCurrency(item.price)} each
                      </Typography>
                    </Box>
                    <Typography fontWeight={700} variant="h6">
                      {formatCurrency(item.line_total)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                    <Button variant="ghost" onClick={() => changeQuantity(item.product_id, Math.max(item.quantity - 1, 0))}>
                      -
                    </Button>
                    <Chip label={`Qty ${item.quantity}`} />
                    <Button variant="ghost" onClick={() => changeQuantity(item.product_id, item.quantity + 1)}>
                      +
                    </Button>
                    <Button variant="secondary" onClick={() => removeItem(item.product_id)}>
                      Remove
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {cart.items.length === 0 ? (
              <Typography color="text.secondary">Your cart is empty. Go back to the dashboard catalog and add products.</Typography>
            ) : null}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography gutterBottom variant="h6">
              Order summary
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Items</Typography>
              <Typography fontWeight={600}>{cart.items.length}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
              <Typography fontWeight={600}>Total</Typography>
              <Typography fontWeight={700}>{formatCurrency(cart.totalAmount)}</Typography>
            </Stack>
            <Stack direction={{ xs: "column" }} spacing={1} sx={{ mt: 3 }}>
              <Button component={RouterLink} fullWidth to="/dashboard" variant="secondary">
                Continue shopping
              </Button>
              <Button component={RouterLink} disabled={cart.items.length === 0} fullWidth to="/checkout">
                Checkout
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Cart;
