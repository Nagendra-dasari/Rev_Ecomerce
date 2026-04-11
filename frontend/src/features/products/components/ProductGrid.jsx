import React from "react";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Button from "../../../components/ui/Button";
import { formatCurrency } from "../../../utils/currency";

function ProductGrid({ products, onAddToCart }) {
  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }} variant="outlined">
            <CardMedia
              alt={product.name}
              component="img"
              image={product.image}
              sx={{ height: 180, objectFit: "cover" }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                <Chip label={product.category} size="small" variant="outlined" />
                <Chip label={`${product.rating} / 5`} size="small" variant="outlined" />
              </Stack>
              <Typography gutterBottom variant="h6">
                {product.name}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {product.description}
              </Typography>
              <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography fontWeight={700} variant="subtitle1">
                  {formatCurrency(product.price)}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Stock {product.stock}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button fullWidth onClick={() => onAddToCart(product.id)}>
                Add to Cart
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ProductGrid;
