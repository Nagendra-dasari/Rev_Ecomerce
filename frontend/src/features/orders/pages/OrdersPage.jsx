import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchOrders } from "../ordersSlice";
import OrderList from "../components/OrderList";

function OrdersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="tag">Orders</span>
          <h2>Track local purchase activity</h2>
        </div>
      </div>
      {status === "loading" ? <p>Loading orders...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {items.length === 0 ? <p className="muted">No orders placed yet.</p> : <OrderList orders={items} />}
    </section>
  );
}

export default OrdersPage;
