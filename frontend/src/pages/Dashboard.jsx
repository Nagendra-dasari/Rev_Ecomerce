import React, { useEffect, useState } from "react";

import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { setSession } from "../features/auth/authSlice";
import { setCart } from "../store/cartSlice";
import { formatCurrency } from "../utils/currency";
import { normalizeApiError } from "../utils/apiError";
import {
  addAddress,
  addCartItem,
  addWishlistItem,
  bulkCreateProducts,
  createProduct,
  getAdminDashboard,
  getAllOrders,
  getCart,
  getInvoice,
  getNotifications,
  getOrders,
  getProducts,
  getProfile,
  getUsers,
  getWishlist,
  markNotificationRead,
  removeWishlistItem,
  updateOrderStatus,
  updateProfile,
} from "../services/storeApi";

const initialFilters = {
  search: "",
  category: "",
  min_price: "",
  max_price: "",
  sort_by: "featured",
  page: 1,
  page_size: 6,
};

const initialAddress = {
  label: "Home",
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  phone: "",
  is_default: false,
};

const initialProductForm = {
  sku: "",
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  image: "",
  tags: "",
  featured: false,
  low_stock_threshold: "5",
};

const adminTabs = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "customers", label: "Customers" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings" },
];

const customerTabs = [
  { id: "shop", label: "Shop" },
  { id: "orders", label: "Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings" },
];

function Dashboard() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const user = auth.user;
  const isAdmin = user?.role === "admin";

  const [tab, setTab] = useState(isAdmin ? "overview" : "shop");
  const [catalog, setCatalog] = useState({ items: [], categories: [], total: 0, total_pages: 1, page: 1 });
  const [filters, setFilters] = useState(initialFilters);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState({ items: [], share_code: "" });
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(user);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [addressForm, setAddressForm] = useState({ ...initialAddress, full_name: user?.name || "", phone: user?.phone || "" });
  const [adminData, setAdminData] = useState(null);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [invoice, setInvoice] = useState("");
  const [bulkJson, setBulkJson] = useState(
    JSON.stringify(
      [
        {
          sku: "NEW-1001",
          name: "Portable Speaker",
          description: "Compact speaker with strong bass and Bluetooth pairing.",
          category: "Electronics",
          price: 1999,
          stock: 16,
          image: "",
          tags: ["audio", "portable"],
          featured: false,
          low_stock_threshold: 4,
        },
      ],
      null,
      2,
    ),
  );
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTab(isAdmin ? "overview" : "shop");
  }, [isAdmin]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let ignore = false;

    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const [profileData, cartData, notificationsData] = await Promise.all([
          getProfile(),
          getCart(),
          getNotifications(),
        ]);

        if (ignore) {
          return;
        }

        dispatch(setSession({ user: profileData, token: auth.token }));
        dispatch(setCart(cartData));
        setProfile(profileData);
        setProfileForm({ name: profileData.name, phone: profileData.phone || "" });
        setAddressForm((current) => ({
          ...current,
          full_name: profileData.name || "",
          phone: profileData.phone || "",
        }));
        setNotifications(notificationsData);

        if (profileData.role === "admin") {
          const [allOrdersResult, dashboardResult, usersResult] = await Promise.allSettled([
            getAllOrders(),
            getAdminDashboard(),
            getUsers(),
          ]);
          if (!ignore) {
            setOrders(allOrdersResult.status === "fulfilled" ? allOrdersResult.value : []);
            setWishlist({ items: [], share_code: "" });
            setAdminData(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
            setAdminCustomers(
              usersResult.status === "fulfilled" ? usersResult.value.filter((item) => item.role !== "admin") : [],
            );
          }
        } else {
          const [orderData, wishlistData] = await Promise.all([getOrders(), getWishlist()]);
          if (!ignore) {
            setOrders(orderData);
            setWishlist(wishlistData);
            setAdminData(null);
            setAdminCustomers([]);
          }
        }

        if (!ignore) {
          setError("");
        }
      } catch (apiError) {
        if (!ignore) {
          setError(normalizeApiError(apiError, "Unable to load workspace"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadWorkspace();
    const intervalId = setInterval(loadWorkspace, isAdmin ? 5000 : 15000);
    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, [auth.token, dispatch, isAdmin, user]);

  useEffect(() => {
    let ignore = false;

    const loadCatalog = async () => {
      try {
        const productData = await getProducts({
          ...filters,
          min_price: filters.min_price || undefined,
          max_price: filters.max_price || undefined,
        });
        if (!ignore) {
          setCatalog(productData);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(normalizeApiError(apiError, "Unable to load products"));
        }
      }
    };

    loadCatalog();
    return () => {
      ignore = true;
    };
  }, [filters]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const visibleTabs = isAdmin ? adminTabs : customerTabs;

  const refreshCatalog = async () => {
    const productData = await getProducts({
      ...filters,
      min_price: filters.min_price || undefined,
      max_price: filters.max_price || undefined,
    });
    setCatalog(productData);
  };

  const refreshAdminData = async () => {
    const [allOrders, dashboardData, usersData] = await Promise.all([
      getAllOrders(),
      getAdminDashboard(),
      getUsers(),
    ]);
    setOrders(allOrders);
    setAdminData(dashboardData);
    setAdminCustomers(usersData.filter((item) => item.role !== "admin"));
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      const cartData = await addCartItem({ product_id: productId, quantity });
      dispatch(setCart(cartData));
      setFeedback("Cart updated.");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to update cart"));
    }
  };

  const handleWishlistToggle = async (productId, exists) => {
    try {
      const data = exists ? await removeWishlistItem(productId) : await addWishlistItem(productId);
      setWishlist(data);
      setFeedback(exists ? "Removed from wishlist." : "Added to wishlist.");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to update wishlist"));
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    try {
      const data = await updateProfile(profileForm);
      setProfile(data);
      dispatch(setSession({ user: data, token: auth.token }));
      setFeedback("Profile updated.");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to update profile"));
    }
  };

  const handleAddressSave = async (event) => {
    event.preventDefault();
    try {
      const addresses = await addAddress(addressForm);
      const updatedProfile = { ...profile, addresses };
      setProfile(updatedProfile);
      dispatch(setSession({ user: updatedProfile, token: auth.token }));
      setAddressForm({ ...initialAddress, full_name: profileForm.name, phone: profileForm.phone, country: "India" });
      setFeedback("Address added.");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to add address"));
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status, message: `Order moved to ${status}` });
      await refreshAdminData();
      setFeedback(`Order marked as ${status}.`);
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to update order status"));
    }
  };

  const openInvoice = async (orderId) => {
    try {
      const data = await getInvoice(orderId);
      setInvoice(data.content);
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to load invoice"));
    }
  };

  const handleBulkUpload = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      await bulkCreateProducts(parsed);
      await Promise.all([refreshCatalog(), refreshAdminData()]);
      setFeedback("Bulk products uploaded.");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to upload products"));
    }
  };

  const handleProductCreate = async (event) => {
    event.preventDefault();
    try {
      await createProduct({
        sku: productForm.sku,
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image: productForm.image,
        tags: productForm.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        featured: productForm.featured,
        low_stock_threshold: Number(productForm.low_stock_threshold),
      });
      setProductForm(initialProductForm);
      await Promise.all([refreshCatalog(), refreshAdminData()]);
      setFeedback("Product created successfully.");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to create product"));
    }
  };

  const markRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, read: true } : item)));
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to mark notification as read"));
    }
  };

  return (
    <div className="page">
      <section className="hero-card">
        <span className="tag">{isAdmin ? "Admin Workspace" : "Customer Workspace"}</span>
        <h1 className="hero-title" style={{ fontSize: 34 }}>
          {isAdmin ? "Manage store operations from an admin-first dashboard" : "Shop, save, and track orders from a customer-first dashboard"}
        </h1>
        <p className="hero-subtitle">
          {isAdmin
            ? "Catalog, orders, customers, and inventory in one place."
            : "Browse products, manage your cart, and track your orders."}
        </p>
        <div className="hero-stats">
          <div className="stat-card">
            <strong>{catalog.total}</strong>
            <p className="muted">{isAdmin ? "Catalog items" : "Products available"}</p>
          </div>
          <div className="stat-card">
            <strong>{orders.length}</strong>
            <p className="muted">{isAdmin ? "Orders to manage" : "Orders on your account"}</p>
          </div>
          <div className="stat-card">
            <strong>{cart.items.length}</strong>
            <p className="muted">{isAdmin ? "Items in your admin cart" : "Items in your cart"}</p>
          </div>
          <div className="stat-card">
            <strong>{notifications.filter((item) => !item.read).length}</strong>
            <p className="muted">Unread notifications</p>
          </div>
        </div>
      </section>

      <div className="chip-row" style={{ marginTop: 20 }}>
        {visibleTabs.map((item) => (
          <button key={item.id} className={`chip ${tab === item.id ? "chip-active" : ""}`} onClick={() => setTab(item.id)} type="button">
            {item.label}
          </button>
        ))}
        {!isAdmin ? (
          <Link className="chip" to="/cart">
            Open cart
          </Link>
        ) : null}
      </div>

      {loading ? <p style={{ marginTop: 20 }}>Loading workspace...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {feedback ? <p className="muted">{feedback}</p> : null}

      {!isAdmin && tab === "shop" ? (
        <section className="stack-lg" style={{ marginTop: 20 }}>
          <div className="panel">
            <div className="space-between" style={{ gap: 16, alignItems: "flex-start" }}>
              <div>
                <h3 style={{ marginBottom: 8 }}>Customer catalog</h3>
                <p className="muted">Browse and filter the catalog.</p>
              </div>
              <Link to="/cart">
                <Button variant="secondary">Go to cart</Button>
              </Link>
            </div>
            <div className="toolbar toolbar-4">
              <Input
                label="Search"
                placeholder="Search products or tags"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
              />
              <Input
                label="Category"
                list="category-options"
                placeholder="All categories"
                value={filters.category}
                onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value, page: 1 }))}
              />
              <Input
                label="Min price"
                type="number"
                value={filters.min_price}
                onChange={(event) => setFilters((current) => ({ ...current, min_price: event.target.value, page: 1 }))}
              />
              <Input
                label="Max price"
                type="number"
                value={filters.max_price}
                onChange={(event) => setFilters((current) => ({ ...current, max_price: event.target.value, page: 1 }))}
              />
            </div>
            <datalist id="category-options">
              {catalog.categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <div className="space-between" style={{ marginTop: 16 }}>
              <label className="input-group" style={{ maxWidth: 220 }}>
                <span>Sort by</span>
                <select
                  className="input"
                  value={filters.sort_by}
                  onChange={(event) => setFilters((current) => ({ ...current, sort_by: event.target.value, page: 1 }))}
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price low to high</option>
                  <option value="price_desc">Price high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </label>
              <p className="muted">
                Page {catalog.page} of {catalog.total_pages}
              </p>
            </div>
          </div>
          <div className="product-grid">
            {catalog.items.map((product) => {
              const wished = wishlist.items.some((item) => item.id === product.id);
              return (
                <article className="product-card" key={product.id}>
                  <Link to={`/products/${product.id}`}>
                    <img alt={product.name} src={product.image} />
                  </Link>
                  <div className="product-meta">
                    <span className="tag">{product.category}</span>
                    <span>{product.rating} / 5</span>
                  </div>
                  <Link to={`/products/${product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p className="muted">{product.description}</p>
                  <div className="space-between">
                    <strong>{formatCurrency(product.price)}</strong>
                    <span className="muted">Stock {product.stock}</span>
                  </div>
                  <div className="chip-row" style={{ marginTop: 14 }}>
                    <Link to={`/products/${product.id}`}>
                      <Button variant="secondary">View</Button>
                    </Link>
                    <Button onClick={() => handleAddToCart(product.id)}>Add to cart</Button>
                    <Button variant="ghost" onClick={() => handleWishlistToggle(product.id, wished)}>
                      {wished ? "Wishlisted" : "Wishlist"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          {catalog.items.length === 0 ? <p className="muted">No products matched your filters.</p> : null}
          <div className="space-between">
            <Button
              type="button"
              variant="secondary"
              disabled={filters.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              type="button"
              disabled={filters.page >= catalog.total_pages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </section>
      ) : null}

      {tab === "orders" ? (
        <section className="stack-lg" style={{ marginTop: 20 }}>
          <div className="panel">
            <h3 style={{ marginBottom: 8 }}>{isAdmin ? "Order operations" : "Your orders"}</h3>
            <p className="muted">
              {isAdmin
                ? "Review and update order status."
                : "Track status and open invoices."}
            </p>
          </div>
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="space-between">
                <div>
                  <h3 style={{ marginBottom: 8 }}>{order.invoice_number}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {order.status} | {order.payment_status} | {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <strong>{formatCurrency(order.total_amount)}</strong>
              </div>
              <div className="chip-row" style={{ marginTop: 16 }}>
                {order.status_history.map((event) => (
                  <span className="chip" key={`${order.id}-${event.timestamp}`}>
                    {event.status}
                  </span>
                ))}
              </div>
              <div className="chip-row" style={{ marginTop: 16 }}>
                <Button type="button" onClick={() => openInvoice(order.id)}>
                  View invoice
                </Button>
                {!isAdmin ? (
                  <Link to="/checkout">
                    <Button variant="secondary">Checkout again</Button>
                  </Link>
                ) : null}
                {isAdmin ? (
                  <>
                    <Button variant="secondary" onClick={() => handleStatusUpdate(order.id, "packed")}>
                      Pack
                    </Button>
                    <Button variant="secondary" onClick={() => handleStatusUpdate(order.id, "shipped")}>
                      Ship
                    </Button>
                    <Button onClick={() => handleStatusUpdate(order.id, "delivered")}>Deliver</Button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
          {orders.length === 0 ? <p className="muted">{isAdmin ? "No orders to manage yet." : "No orders yet. Add items to cart and place your first order."}</p> : null}
        </section>
      ) : null}

      {!isAdmin && tab === "wishlist" ? (
        <section className="stack-lg" style={{ marginTop: 20 }}>
          <div className="panel">
            <strong>Wishlist share code</strong>
            <p className="muted">{wishlist.share_code || "No share code yet"}</p>
          </div>
          <div className="product-grid">
            {wishlist.items.map((product) => (
              <article className="product-card" key={product.id}>
                <Link to={`/products/${product.id}`}>
                  <img alt={product.name} src={product.image} />
                </Link>
                <Link to={`/products/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>
                <p className="muted">{product.category}</p>
                <div className="chip-row">
                  <Button onClick={() => handleAddToCart(product.id)}>Add to cart</Button>
                  <Button variant="ghost" onClick={() => handleWishlistToggle(product.id, true)}>
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {wishlist.items.length === 0 ? <p className="muted">Save products here to purchase them later.</p> : null}
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section className="stack-lg" style={{ marginTop: 20 }}>
          <div className="panel">
            <h3 style={{ marginBottom: 8 }}>{isAdmin ? "Admin notifications" : "Your notifications"}</h3>
            <p className="muted">{isAdmin ? "Order activity and system updates for admins." : "Order and account updates for your account."}</p>
          </div>
          {notifications.map((notification) => (
            <article className={`panel ${notification.read ? "" : "panel-highlight"}`} key={notification.id}>
              <div className="space-between">
                <div>
                  <strong>{notification.title}</strong>
                  <p className="muted" style={{ marginTop: 8 }}>
                    {notification.message}
                  </p>
                </div>
                <span className="tag">{notification.type}</span>
              </div>
              <div className="chip-row" style={{ marginTop: 16 }}>
                <span className="chip">{new Date(notification.created_at).toLocaleString()}</span>
                {notification.link ? (
                  <Link to={notification.link}>
                    <Button variant="ghost">Open</Button>
                  </Link>
                ) : null}
                {!notification.read ? (
                  <Button variant="secondary" onClick={() => markRead(notification.id)}>
                    Mark read
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
          {notifications.length === 0 ? <p className="muted">You have no notifications right now.</p> : null}
        </section>
      ) : null}

      {tab === "settings" ? (
        <section className="layout-grid" style={{ marginTop: 20 }}>
          <form className="panel stack-md" onSubmit={handleProfileSave}>
            <h3>{isAdmin ? "Admin profile" : "Profile management"}</h3>
            <Input
              label="Name"
              value={profileForm.name}
              onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              label="Phone"
              value={profileForm.phone}
              onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <Button type="submit">Save profile</Button>
          </form>
          <form className="panel stack-md" onSubmit={handleAddressSave}>
            <h3>{isAdmin ? "Default business address" : "Add address"}</h3>
            {Object.entries(addressForm).map(([key, value]) =>
              typeof value === "boolean" ? null : (
                <Input
                  key={key}
                  label={key.replaceAll("_", " ")}
                  value={value}
                  onChange={(event) => setAddressForm((current) => ({ ...current, [key]: event.target.value }))}
                />
              ),
            )}
            <Button type="submit">{isAdmin ? "Save address" : "Add address"}</Button>
          </form>
          <div className="panel stack-md">
            <h3>Saved addresses</h3>
            {(profile?.addresses || []).map((address) => (
              <div className="stat-card" key={address.id}>
                <strong>{address.label}</strong>
                <p className="muted">
                  {address.full_name}, {address.line1}, {address.city}, {address.state}
                </p>
              </div>
            ))}
            {(profile?.addresses || []).length === 0 ? <p className="muted">No addresses saved yet.</p> : null}
          </div>
        </section>
      ) : null}

      {isAdmin && tab === "overview" ? (
        <section className="stack-lg" style={{ marginTop: 20 }}>
          <div className="hero-stats">
            {(adminData?.metrics || []).map((metric) => (
              <div className="stat-card" key={metric.label}>
                <strong>{typeof metric.value === "number" && metric.label === "Revenue" ? formatCurrency(metric.value) : metric.value}</strong>
                <p className="muted">{metric.label}</p>
              </div>
            ))}
          </div>
          <div className="layout-grid">
            <div className="panel stack-md">
              <h3>Low stock alerts</h3>
              {(adminData?.low_stock_products || []).map((product) => (
                <div className="summary-row" key={product.id}>
                  <span>{product.name}</span>
                  <strong>{product.stock}</strong>
                </div>
              ))}
              {(adminData?.low_stock_products || []).length === 0 ? <p className="muted">No low stock alerts right now.</p> : null}
            </div>
            <div className="panel stack-md">
              <h3>Recent customers</h3>
              {adminCustomers.slice(0, 5).map((customer) => (
                <div className="stat-card" key={customer.id}>
                  <strong>{customer.name}</strong>
                  <p className="muted">{customer.email}</p>
                </div>
              ))}
              {adminCustomers.length === 0 ? <p className="muted">No customers yet.</p> : null}
            </div>
            <div className="panel stack-md">
              <h3>Recent orders</h3>
              {(adminData?.recent_orders || []).map((order) => (
                <div className="stat-card" key={order.id}>
                  <strong>{order.invoice_number}</strong>
                  <p className="muted">{order.status}</p>
                </div>
              ))}
              {(adminData?.recent_orders || []).length === 0 ? <p className="muted">No recent orders.</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {isAdmin && tab === "products" ? (
        <section className="stack-lg" style={{ marginTop: 20 }}>
          <div className="layout-grid">
            <form className="panel stack-md" onSubmit={handleProductCreate}>
              <h3>Add product</h3>
              <Input label="SKU" value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} />
              <Input label="Name" value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} />
              <Input
                label="Category"
                value={productForm.category}
                onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
              />
              <Input label="Price" type="number" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} />
              <Input label="Stock" type="number" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
              <Input
                label="Image URL"
                value={productForm.image}
                onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))}
              />
              <Input
                label="Tags"
                placeholder="audio, featured, travel"
                value={productForm.tags}
                onChange={(event) => setProductForm((current) => ({ ...current, tags: event.target.value }))}
              />
              <Input
                label="Low stock threshold"
                type="number"
                value={productForm.low_stock_threshold}
                onChange={(event) => setProductForm((current) => ({ ...current, low_stock_threshold: event.target.value }))}
              />
              <label className="chip-row" style={{ alignItems: "center" }}>
                <input
                  checked={productForm.featured}
                  onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))}
                  type="checkbox"
                />
                <span>Mark as featured</span>
              </label>
              <label className="input-group">
                <span>Description</span>
                <textarea
                  className="input textarea"
                  rows="5"
                  value={productForm.description}
                  onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <Button type="submit">Create product</Button>
            </form>

            <div className="panel stack-md">
              <h3>Bulk product upload</h3>
              <p className="muted">Import several products at once.</p>
              <textarea className="input textarea" rows="14" value={bulkJson} onChange={(event) => setBulkJson(event.target.value)} />
              <Button type="button" onClick={handleBulkUpload}>
                Upload products
              </Button>
            </div>
          </div>

          <div className="panel stack-md">
            <div className="space-between">
              <div>
                <h3 style={{ marginBottom: 8 }}>Current catalog</h3>
                <p className="muted">Products currently visible in the storefront.</p>
              </div>
              <Button type="button" variant="secondary" onClick={refreshCatalog}>
                Refresh catalog
              </Button>
            </div>
            <div className="product-grid">
              {catalog.items.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link to={`/products/${product.id}`}>
                    <img alt={product.name} src={product.image} />
                  </Link>
                  <div className="product-meta">
                    <span className="tag">{product.category}</span>
                    <span>{product.featured ? "Featured" : "Standard"}</span>
                  </div>
                  <Link to={`/products/${product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p className="muted">{product.description}</p>
                  <div className="space-between">
                    <strong>{formatCurrency(product.price)}</strong>
                    <span className="muted">Stock {product.stock}</span>
                  </div>
                </article>
              ))}
            </div>
            {catalog.items.length === 0 ? <p className="muted">There are no products in the catalog yet. Use the add product form above.</p> : null}
          </div>
        </section>
      ) : null}

      {isAdmin && tab === "customers" ? (
        <section className="stack-lg" style={{ marginTop: 20 }}>
          <div className="panel">
            <h3 style={{ marginBottom: 8 }}>Customer directory</h3>
            <p className="muted">Customer accounts in the system.</p>
          </div>
          {adminCustomers.map((customer) => (
            <article className="panel" key={customer.id}>
              <div className="space-between">
                <div>
                  <strong>{customer.name}</strong>
                  <p className="muted" style={{ marginTop: 8 }}>
                    {customer.email}
                  </p>
                </div>
                <span className="tag">{customer.role}</span>
              </div>
              <p className="muted" style={{ marginTop: 12 }}>
                Phone: {customer.phone || "Not provided"}
              </p>
            </article>
          ))}
          {adminCustomers.length === 0 ? <p className="muted">No customers available yet.</p> : null}
        </section>
      ) : null}

      <Modal isOpen={Boolean(invoice)} title="Invoice Preview" onClose={() => setInvoice("")}>
        <pre>{invoice}</pre>
      </Modal>
    </div>
  );
}

export default Dashboard;
