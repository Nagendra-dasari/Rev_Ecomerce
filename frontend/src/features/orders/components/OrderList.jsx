import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { formatCurrency } from "../../../utils/currency";

function OrderList({ orders }) {
  return (
    <Grid container spacing={2}>
      {orders.map((order) => (
        <Grid key={order.id} size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="h6">{order.id}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {new Date(order.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Chip label={order.status} size="small" />
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                {order.shipping_address}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                {order.items.map((item) => (
                  <Chip key={`${order.id}-${item.product_id}`} label={`${item.name} x ${item.quantity}`} size="small" variant="outlined" />
                ))}
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                <Typography fontWeight={600}>Total</Typography>
                <Typography fontWeight={700}>{formatCurrency(order.total_amount)}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default OrderList;
