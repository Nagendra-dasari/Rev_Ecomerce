import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Input from "../../../components/ui/Input";
import { fetchProducts, setFilters } from "../productsSlice";
import ProductGrid from "../components/ProductGrid";

function ProductsPage({ onAddToCart }) {
  const dispatch = useDispatch();
  const { items, status, error, filters, categories, total, page, totalPages } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Chip color="primary" label="Catalog" size="small" variant="outlined" />
        <Typography variant="h5">Shop the current local inventory</Typography>
      </Stack>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Input
            label="Search products"
            placeholder="Headphones, smartwatch, backpack..."
            value={filters.search}
            onChange={(event) => dispatch(setFilters({ search: event.target.value }))}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Input
            label="Category"
            placeholder="Electronics"
            value={filters.category}
            onChange={(event) => dispatch(setFilters({ category: event.target.value }))}
          />
        </Grid>
      </Grid>
      {categories.length ? (
        <Typography color="text.secondary" sx={{ mb: 1 }} variant="body2">
          Categories: {categories.join(", ")}
        </Typography>
      ) : null}
      {status === "loading" ? <Typography sx={{ mb: 1 }}>Loading products...</Typography> : null}
      {error ? (
        <Typography color="error" sx={{ mb: 1 }} variant="body2">
          {error}
        </Typography>
      ) : null}
      {!error ? (
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
          Showing {items.length} of {total} products. Page {page} of {totalPages}.
        </Typography>
      ) : null}
      <ProductGrid products={items} onAddToCart={onAddToCart} />
    </Box>
  );
}

export default ProductsPage;
