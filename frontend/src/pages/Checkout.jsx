import React, { useEffect, useMemo, useState } from "react";

import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { setCart } from "../store/cartSlice";
import { formatCurrency } from "../utils/currency";
import { normalizeApiError } from "../utils/apiError";
import { createOrder, getCart, getProfile } from "../services/storeApi";

const emptyAddress = {
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  phone: "",
};

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart);
  const [profile, setProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [customAddress, setCustomAddress] = useState(emptyAddress);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) {
        return;
      }
      try {
        const [profileData, cartData] = await Promise.all([getProfile(), getCart()]);
        if (!ignore) {
          setProfile(profileData);
          dispatch(setCart(cartData));
          const defaultAddress = profileData.addresses.find((address) => address.is_default) || profileData.addresses[0];
          setSelectedAddressId(defaultAddress?.id || "");
          setCustomAddress(
            defaultAddress
              ? { ...defaultAddress }
              : { ...emptyAddress, full_name: profileData.name || "", phone: profileData.phone || "", country: "India" },
          );
        }
      } catch (apiError) {
        if (!ignore) {
          setError(normalizeApiError(apiError, "Unable to load checkout"));
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [dispatch, user]);

  const shippingAddress = useMemo(() => {
    if (!profile) {
      return customAddress;
    }
    return profile.addresses.find((address) => address.id === selectedAddressId) || customAddress;
  }, [customAddress, profile, selectedAddressId]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (cart.items.length === 0 && profile) {
    return <Navigate to="/cart" replace />;
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const order = await createOrder({
        items: cart.items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        shipping_address: {
          full_name: shippingAddress.full_name,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        payment_method: paymentMethod,
      });
      dispatch(setCart({ items: [], total_amount: 0 }));
      navigate("/dashboard", { state: { placedOrderId: order.id } });
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to place order"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="hero-card">
        <span className="tag">Checkout & Payments</span>
        <h1 className="hero-title" style={{ fontSize: 30 }}>
          Confirm address and payment
        </h1>
        <p className="hero-subtitle">Pick a saved address or enter a new one, then simulate payment and place the order.</p>
      </section>
      {error ? <p className="error">{error}</p> : null}
      <section className="layout-grid" style={{ marginTop: 20 }}>
        <form className="panel stack-md" onSubmit={placeOrder}>
          <h3>Shipping address</h3>
          {profile?.addresses?.length ? (
            <label className="input-group">
              <span>Saved addresses</span>
              <select className="input" value={selectedAddressId} onChange={(event) => setSelectedAddressId(event.target.value)}>
                {profile.addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.city}
                  </option>
                ))}
                <option value="">Use custom address</option>
              </select>
            </label>
          ) : null}
          {!selectedAddressId
            ? Object.entries(customAddress).map(([key, value]) => (
                <Input
                  key={key}
                  label={key.replaceAll("_", " ")}
                  value={value}
                  onChange={(event) => setCustomAddress((current) => ({ ...current, [key]: event.target.value }))}
                />
              ))
            : null}
          <label className="input-group">
            <span>Payment method</span>
            <select className="input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </label>
          <Button disabled={loading} type="submit">
            {loading ? "Placing order..." : "Place order"}
          </Button>
        </form>
        <aside className="sidebar panel">
          <h3>Order confirmation</h3>
          {cart.items.map((item) => (
            <div className="summary-row" key={item.product_id}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatCurrency(item.line_total)}</strong>
            </div>
          ))}
          <div className="summary-row" style={{ marginTop: 16 }}>
            <span>Total</span>
            <strong>{formatCurrency(cart.totalAmount)}</strong>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Checkout;
