import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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
    <section>
      <div className="section-head">
        <div>
          <span className="tag">Catalog</span>
          <h2>Shop the current local inventory</h2>
        </div>
      </div>
      <div className="toolbar">
        <Input
          label="Search products"
          placeholder="Headphones, smartwatch, backpack..."
          value={filters.search}
          onChange={(event) => dispatch(setFilters({ search: event.target.value }))}
        />
        <Input
          label="Category"
          placeholder="Electronics"
          value={filters.category}
          onChange={(event) => dispatch(setFilters({ category: event.target.value }))}
        />
      </div>
      {categories.length ? (
        <p className="muted" style={{ marginTop: 12 }}>
          Categories: {categories.join(", ")}
        </p>
      ) : null}
      {status === "loading" ? <p>Loading products...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!error ? (
        <p className="muted">
          Showing {items.length} of {total} products. Page {page} of {totalPages}.
        </p>
      ) : null}
      <ProductGrid products={items} onAddToCart={onAddToCart} />
    </section>
  );
}

export default ProductsPage;
