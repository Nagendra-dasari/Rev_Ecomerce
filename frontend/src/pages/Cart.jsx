import React, { useEffect, useState } from "react";

import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

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
    <div className="page">
      <section className="hero-card">
        <div className="space-between">
          <div>
            <span className="tag">Cart</span>
            <h1 className="hero-title" style={{ fontSize: 30 }}>
              Persistent shopping cart
            </h1>
            <p className="hero-subtitle">Your cart is saved on the backend, so it survives refreshes and new sessions.</p>
          </div>
          <Button variant="ghost" onClick={clearAll}>
            Clear cart
          </Button>
        </div>
      </section>
      {error ? <p className="error">{error}</p> : null}
      <section className="layout-grid" style={{ marginTop: 20 }}>
        <div className="panel stack-lg">
          {cart.items.map((item) => (
            <article className="product-card" key={item.product_id}>
              <div className="space-between">
                <div>
                  <Link to={`/products/${item.product_id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="muted">{formatCurrency(item.price)} each</p>
                </div>
                <strong>{formatCurrency(item.line_total)}</strong>
              </div>
              <div className="chip-row">
                <Button variant="ghost" onClick={() => changeQuantity(item.product_id, Math.max(item.quantity - 1, 0))}>
                  -
                </Button>
                <span className="chip">Qty {item.quantity}</span>
                <Button variant="ghost" onClick={() => changeQuantity(item.product_id, item.quantity + 1)}>
                  +
                </Button>
                <Button variant="secondary" onClick={() => removeItem(item.product_id)}>
                  Remove
                </Button>
              </div>
            </article>
          ))}
          {cart.items.length === 0 ? <p className="muted">Your cart is empty. Go back to the dashboard catalog and add products.</p> : null}
        </div>
        <aside className="sidebar panel">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <strong>{cart.items.length}</strong>
          </div>
          <div className="summary-row" style={{ marginTop: 12 }}>
            <span>Total</span>
            <strong>{formatCurrency(cart.totalAmount)}</strong>
          </div>
          <div className="chip-row" style={{ marginTop: 20 }}>
            <Link to="/dashboard">
              <Button variant="secondary">Continue shopping</Button>
            </Link>
            <Link to="/checkout">
              <Button disabled={cart.items.length === 0}>Checkout</Button>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Cart;
