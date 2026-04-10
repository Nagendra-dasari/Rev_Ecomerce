import React from "react";

import Button from "../../../components/ui/Button";
import { formatCurrency } from "../../../utils/currency";

function ProductGrid({ products, onAddToCart }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <img alt={product.name} src={product.image} />
          <div className="product-meta">
            <span className="tag">{product.category}</span>
            <span>{product.rating} / 5</span>
          </div>
          <div>
            <h3>{product.name}</h3>
            <p className="muted">{product.description}</p>
          </div>
          <div className="space-between">
            <span className="price">{formatCurrency(product.price)}</span>
            <span className="muted">Stock {product.stock}</span>
          </div>
          <Button onClick={() => onAddToCart(product.id)}>Add to Cart</Button>
        </article>
      ))}
    </div>
  );
}

export default ProductGrid;
