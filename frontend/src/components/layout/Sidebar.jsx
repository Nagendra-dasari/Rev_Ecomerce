import React from "react";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import Button from "../ui/Button";

function Sidebar({ cartItems, totalAmount, onCheckout }) {
  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Typography gutterBottom variant="h6">
        Cart Summary
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
        Review selected items before submitting the order.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {cartItems.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No items in cart yet.
          </Typography>
        ) : (
          cartItems.map((item) => (
            <Chip key={item.productId} label={`${item.name} x ${item.quantity}`} size="small" variant="outlined" />
          ))
        )}
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography fontWeight={600}>Total</Typography>
        <Typography fontWeight={700}>Rs. {totalAmount.toFixed(2)}</Typography>
      </Stack>
      <Button disabled={cartItems.length === 0} fullWidth sx={{ mt: 2 }} type="button" onClick={onCheckout}>
        Place Order
      </Button>
    </Paper>
  );
}

export default Sidebar;
