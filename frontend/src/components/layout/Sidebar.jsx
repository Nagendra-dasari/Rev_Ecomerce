import React from "react";

function Sidebar({ cartItems, totalAmount, onCheckout }) {
  return (
    <aside className="sidebar panel">
      <h3>Cart Summary</h3>
      <p className="muted">Review selected items before submitting the order.</p>
      <div className="chip-row">
        {cartItems.length === 0 ? (
          <span className="muted">No items in cart yet.</span>
        ) : (
          cartItems.map((item) => (
            <span className="chip" key={item.productId}>
              {item.name} x {item.quantity}
            </span>
          ))
        )}
      </div>
      <div className="summary-row" style={{ marginTop: 20 }}>
        <strong>Total</strong>
        <strong>Rs. {totalAmount.toFixed(2)}</strong>
      </div>
      <button
        className="button button-primary"
        type="button"
        onClick={onCheckout}
        disabled={cartItems.length === 0}
        style={{ marginTop: 20, width: "100%" }}
      >
        Place Order
      </button>
    </aside>
  );
}

export default Sidebar;
