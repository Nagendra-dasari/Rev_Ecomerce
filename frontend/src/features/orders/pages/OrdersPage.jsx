import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { fetchOrders } from "../ordersSlice";
import OrderList from "../components/OrderList";

function OrdersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Chip color="primary" label="Orders" size="small" variant="outlined" />
        <Typography variant="h5">Track local purchase activity</Typography>
      </Stack>
      {status === "loading" ? <Typography>Loading orders...</Typography> : null}
      {error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : null}
      {items.length === 0 ? (
        <Typography color="text.secondary">No orders placed yet.</Typography>
      ) : (
        <OrderList orders={items} />
      )}
    </Box>
  );
}

export default OrdersPage;
