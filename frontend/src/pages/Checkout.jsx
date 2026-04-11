import React, { useEffect, useMemo, useState } from "react";

import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { setCart } from "../store/cartSlice";
import { formatCurrency } from "../utils/currency";
import { normalizeApiError } from "../utils/apiError";
import { createOrder, getCart, getProfile } from "../services/storeApi";

const emptyAddress = {
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  phone: "",
};

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart);
  const [profile, setProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [customAddress, setCustomAddress] = useState(emptyAddress);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) {
        return;
      }
      try {
        const [profileData, cartData] = await Promise.all([getProfile(), getCart()]);
        if (!ignore) {
          setProfile(profileData);
          dispatch(setCart(cartData));
          const defaultAddress = profileData.addresses.find((address) => address.is_default) || profileData.addresses[0];
          setSelectedAddressId(defaultAddress?.id || "");
          setCustomAddress(
            defaultAddress
              ? { ...defaultAddress }
              : { ...emptyAddress, full_name: profileData.name || "", phone: profileData.phone || "", country: "India" },
          );
        }
      } catch (apiError) {
        if (!ignore) {
          setError(normalizeApiError(apiError, "Unable to load checkout"));
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [dispatch, user]);

  const shippingAddress = useMemo(() => {
    if (!profile) {
      return customAddress;
    }
    return profile.addresses.find((address) => address.id === selectedAddressId) || customAddress;
  }, [customAddress, profile, selectedAddressId]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (cart.items.length === 0 && profile) {
    return <Navigate to="/cart" replace />;
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const order = await createOrder({
        items: cart.items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        shipping_address: {
          full_name: shippingAddress.full_name,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        payment_method: paymentMethod,
      });
      dispatch(setCart({ items: [], total_amount: 0 }));
      navigate("/dashboard", { state: { placedOrderId: order.id } });
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to place order"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
      <Paper sx={{ mb: 3, p: 2 }} variant="outlined">
        <Typography color="primary" sx={{ fontWeight: 600, mb: 1 }} variant="overline">
          Checkout & Payments
        </Typography>
        <Typography gutterBottom variant="h4">
          Confirm address and payment
        </Typography>
        <Typography color="text.secondary">
          Pick a saved address or enter a new one, then simulate payment and place the order.
        </Typography>
      </Paper>
      {error ? (
        <Typography color="error" sx={{ mb: 2 }} variant="body2">
          {error}
        </Typography>
      ) : null}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper component="form" onSubmit={placeOrder} sx={{ p: 2 }} variant="outlined">
            <Typography gutterBottom variant="h6">
              Shipping address
            </Typography>
            {profile?.addresses?.length ? (
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="addr-label">Saved addresses</InputLabel>
                <Select
                  id="addr"
                  label="Saved addresses"
                  labelId="addr-label"
                  value={selectedAddressId}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                >
                  {profile.addresses.map((address) => (
                    <MenuItem key={address.id} value={address.id}>
                      {address.label} - {address.city}
                    </MenuItem>
                  ))}
                  <MenuItem value="">Use custom address</MenuItem>
                </Select>
              </FormControl>
            ) : null}
            {!selectedAddressId
              ? Object.entries(customAddress).map(([key, value]) => (
                  <Input
                    key={key}
                    label={key.replaceAll("_", " ")}
                    value={value}
                    onChange={(event) => setCustomAddress((current) => ({ ...current, [key]: event.target.value }))}
                  />
                ))
              : null}
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="pay-label">Payment method</InputLabel>
              <Select
                id="pay"
                label="Payment method"
                labelId="pay-label"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Button disabled={loading} type="submit">
                {loading ? "Placing order..." : "Place order"}
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography gutterBottom variant="h6">
              Order confirmation
            </Typography>
            {cart.items.map((item) => (
              <Stack direction="row" justifyContent="space-between" key={item.product_id} sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="body2">
                  {item.name} x {item.quantity}
                </Typography>
                <Typography fontWeight={600} variant="body2">
                  {formatCurrency(item.line_total)}
                </Typography>
              </Stack>
            ))}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
              <Typography fontWeight={600}>Total</Typography>
              <Typography fontWeight={700}>{formatCurrency(cart.totalAmount)}</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Checkout;
