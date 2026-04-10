import React from "react";

import { formatCurrency } from "../../../utils/currency";

function OrderList({ orders }) {
  return (
    <div className="order-grid">
      {orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div className="space-between">
            <div>
              <h3>{order.id}</h3>
              <p className="muted">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <span className="tag">{order.status}</span>
          </div>
          <p className="muted">{order.shipping_address}</p>
          <div className="chip-row">
            {order.items.map((item) => (
              <span className="chip" key={`${order.id}-${item.product_id}`}>
                {item.name} x {item.quantity}
              </span>
            ))}
          </div>
          <div className="summary-row" style={{ marginTop: 14 }}>
            <strong>Total</strong>
            <strong>{formatCurrency(order.total_amount)}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

export default OrderList;
