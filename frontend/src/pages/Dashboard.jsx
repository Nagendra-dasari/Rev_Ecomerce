import React, { useEffect, useState } from "react";

import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
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
    <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
      <Stack spacing={3}>
        <Card variant="outlined">
          <CardContent>
            <Chip color="primary" label={isAdmin ? "Admin Workspace" : "Customer Workspace"} size="small" sx={{ mb: 1 }} />
            <Typography gutterBottom variant="h4">
              {isAdmin
                ? "Manage store operations from an admin-first dashboard"
                : "Shop, save, and track orders from a customer-first dashboard"}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {isAdmin
                ? "Catalog, orders, customers, and inventory in one place."
                : "Browse products, manage your cart, and track your orders."}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h5">{catalog.total}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {isAdmin ? "Catalog items" : "Products available"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h5">{orders.length}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {isAdmin ? "Orders to manage" : "Orders on your account"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h5">{cart.items.length}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {isAdmin ? "Items in your admin cart" : "Items in your cart"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h5">{notifications.filter((item) => !item.read).length}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Unread notifications
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Stack direction="row" gap={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <ToggleButtonGroup exclusive size="small" value={tab} onChange={(_, value) => value && setTab(value)}>
            {visibleTabs.map((item) => (
              <ToggleButton key={item.id} value={item.id}>
                {item.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {!isAdmin ? (
            <Button component={Link} to="/cart" variant="secondary">
              Open cart
            </Button>
          ) : null}
        </Stack>

        {loading ? <Typography>Loading workspace...</Typography> : null}
        {error ? (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        ) : null}
        {feedback ? (
          <Typography color="text.secondary" variant="body2">
            {feedback}
          </Typography>
        ) : null}

      {!isAdmin && tab === "shop" ? (
        <Stack spacing={3}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Stack spacing={2} sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}>
              <Box>
                <Typography gutterBottom variant="h6">
                  Customer catalog
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Browse and filter the catalog.
                </Typography>
              </Box>
              <Button component={Link} to="/cart" variant="secondary">
                Go to cart
              </Button>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Input
                  label="Search"
                  placeholder="Search products or tags"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Input
                  label="Category"
                  placeholder="All categories"
                  slotProps={{ htmlInput: { list: "category-options" } }}
                  value={filters.category}
                  onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value, page: 1 }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Input
                  label="Min price"
                  type="number"
                  value={filters.min_price}
                  onChange={(event) => setFilters((current) => ({ ...current, min_price: event.target.value, page: 1 }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Input
                  label="Max price"
                  type="number"
                  value={filters.max_price}
                  onChange={(event) => setFilters((current) => ({ ...current, max_price: event.target.value, page: 1 }))}
                />
              </Grid>
            </Grid>
            <datalist id="category-options">
              {catalog.categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <Stack spacing={2} sx={{ mt: 2, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="dash-sort-label">Sort by</InputLabel>
                <Select
                  id="dash-sort"
                  label="Sort by"
                  labelId="dash-sort-label"
                  value={filters.sort_by}
                  onChange={(event) => setFilters((current) => ({ ...current, sort_by: event.target.value, page: 1 }))}
                >
                  <MenuItem value="featured">Featured</MenuItem>
                  <MenuItem value="price_asc">Price low to high</MenuItem>
                  <MenuItem value="price_desc">Price high to low</MenuItem>
                  <MenuItem value="rating">Top rated</MenuItem>
                </Select>
              </FormControl>
              <Typography color="text.secondary" variant="body2">
                Page {catalog.page} of {catalog.total_pages}
              </Typography>
            </Stack>
          </Paper>
          <Grid container spacing={2}>
            {catalog.items.map((product) => {
              const wished = wishlist.items.some((item) => item.id === product.id);
              return (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }} variant="outlined">
                    <CardActionArea component={Link} to={`/products/${product.id}`}>
                      <CardMedia alt={product.name} component="img" image={product.image} sx={{ height: 180, objectFit: "cover" }} />
                    </CardActionArea>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" gap={0.5} sx={{ mb: 1, flexWrap: "wrap" }}>
                        <Chip label={product.category} size="small" />
                        <Chip label={`${product.rating} / 5`} size="small" variant="outlined" />
                      </Stack>
                      <Typography component={Link} sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }} to={`/products/${product.id}`} variant="subtitle1">
                        {product.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                        {product.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center", justifyContent: "space-between" }}>
                        <Typography fontWeight={700}>{formatCurrency(product.price)}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Stock {product.stock}
                        </Typography>
                      </Stack>
                      <Stack direction="row" gap={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                        <Button component={Link} to={`/products/${product.id}`} variant="secondary">
                          View
                        </Button>
                        <Button onClick={() => handleAddToCart(product.id)}>Add to cart</Button>
                        <Button variant="ghost" onClick={() => handleWishlistToggle(product.id, wished)}>
                          {wished ? "Wishlisted" : "Wishlist"}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          {catalog.items.length === 0 ? (
            <Typography color="text.secondary">No products matched your filters.</Typography>
          ) : null}
          <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
            <Button
              disabled={filters.page <= 1}
              type="button"
              variant="secondary"
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              disabled={filters.page >= catalog.total_pages}
              type="button"
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {tab === "orders" ? (
        <Stack spacing={3}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography gutterBottom variant="h6">
              {isAdmin ? "Order operations" : "Your orders"}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {isAdmin ? "Review and update order status." : "Track status and open invoices."}
            </Typography>
          </Paper>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ p: 2 }} variant="outlined">
              <Stack spacing={2} sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box>
                  <Typography gutterBottom variant="subtitle1">
                    {order.invoice_number}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {order.status} | {order.payment_status} | {new Date(order.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Typography fontWeight={700}>{formatCurrency(order.total_amount)}</Typography>
              </Stack>
              <Stack direction="row" gap={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                {order.status_history.map((event) => (
                  <Chip key={`${order.id}-${event.timestamp}`} label={event.status} size="small" variant="outlined" />
                ))}
              </Stack>
              <Stack direction="row" gap={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Button type="button" onClick={() => openInvoice(order.id)}>
                  View invoice
                </Button>
                {!isAdmin ? (
                  <Button component={Link} to="/checkout" variant="secondary">
                    Checkout again
                  </Button>
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
              </Stack>
            </Paper>
          ))}
          {orders.length === 0 ? (
            <Typography color="text.secondary">
              {isAdmin ? "No orders to manage yet." : "No orders yet. Add items to cart and place your first order."}
            </Typography>
          ) : null}
        </Stack>
      ) : null}

      {!isAdmin && tab === "wishlist" ? (
        <Stack spacing={3}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography fontWeight={600} variant="subtitle2">
              Wishlist share code
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
              {wishlist.share_code || "No share code yet"}
            </Typography>
          </Paper>
          <Grid container spacing={2}>
            {wishlist.items.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: "100%" }} variant="outlined">
                  <CardActionArea component={Link} to={`/products/${product.id}`}>
                    <CardMedia alt={product.name} component="img" image={product.image} sx={{ height: 180, objectFit: "cover" }} />
                  </CardActionArea>
                  <CardContent>
                    <Typography component={Link} sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }} to={`/products/${product.id}`} variant="subtitle1">
                      {product.name}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                      {product.category}
                    </Typography>
                    <Stack direction="row" gap={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                      <Button onClick={() => handleAddToCart(product.id)}>Add to cart</Button>
                      <Button variant="ghost" onClick={() => handleWishlistToggle(product.id, true)}>
                        Remove
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {wishlist.items.length === 0 ? <Typography color="text.secondary">Save products here to purchase them later.</Typography> : null}
        </Stack>
      ) : null}

      {tab === "notifications" ? (
        <Stack spacing={3}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography gutterBottom variant="h6">
              {isAdmin ? "Admin notifications" : "Your notifications"}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {isAdmin ? "Order activity and system updates for admins." : "Order and account updates for your account."}
            </Typography>
          </Paper>
          {notifications.map((notification) => (
            <Paper
              key={notification.id}
              sx={(theme) => ({
                p: 2,
                ...(!notification.read
                  ? { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }
                  : {}),
              })}
              variant="outlined"
            >
              <Stack spacing={2} sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box>
                  <Typography fontWeight={600}>{notification.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                    {notification.message}
                  </Typography>
                </Box>
                <Chip label={notification.type} size="small" />
              </Stack>
              <Stack direction="row" gap={1} sx={{ mt: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Chip label={new Date(notification.created_at).toLocaleString()} size="small" variant="outlined" />
                {notification.link ? (
                  <Button component={Link} to={notification.link} variant="ghost">
                    Open
                  </Button>
                ) : null}
                {!notification.read ? (
                  <Button variant="secondary" onClick={() => markRead(notification.id)}>
                    Mark read
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          ))}
          {notifications.length === 0 ? <Typography color="text.secondary">You have no notifications right now.</Typography> : null}
        </Stack>
      ) : null}

      {tab === "settings" ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper component="form" sx={{ p: 2 }} variant="outlined" onSubmit={handleProfileSave}>
              <Stack spacing={2}>
                <Typography variant="h6">{isAdmin ? "Admin profile" : "Profile management"}</Typography>
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
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper component="form" sx={{ p: 2 }} variant="outlined" onSubmit={handleAddressSave}>
              <Stack spacing={2}>
                <Typography variant="h6">{isAdmin ? "Default business address" : "Add address"}</Typography>
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
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2 }} variant="outlined">
              <Typography gutterBottom variant="h6">
                Saved addresses
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={2}>
                {(profile?.addresses || []).map((address) => (
                  <Box key={address.id}>
                    <Typography fontWeight={600}>{address.label}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {address.full_name}, {address.line1}, {address.city}, {address.state}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              {(profile?.addresses || []).length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                  No addresses saved yet.
                </Typography>
              ) : null}
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {isAdmin && tab === "overview" ? (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            {(adminData?.metrics || []).map((metric) => (
              <Grid key={metric.label} size={{ xs: 6, sm: 4, md: 3 }}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6">
                    {typeof metric.value === "number" && metric.label === "Revenue" ? formatCurrency(metric.value) : metric.value}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {metric.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Typography gutterBottom variant="h6">
                  Low stock alerts
                </Typography>
                <Stack divider={<Divider />} spacing={0}>
                  {(adminData?.low_stock_products || []).map((product) => (
                    <Stack direction="row" key={product.id} sx={{ py: 1.5, alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">{product.name}</Typography>
                      <Typography fontWeight={700}>{product.stock}</Typography>
                    </Stack>
                  ))}
                </Stack>
                {(adminData?.low_stock_products || []).length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    No low stock alerts right now.
                  </Typography>
                ) : null}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Typography gutterBottom variant="h6">
                  Recent customers
                </Typography>
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {adminCustomers.slice(0, 5).map((customer) => (
                    <Box key={customer.id}>
                      <Typography fontWeight={600}>{customer.name}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {customer.email}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                {adminCustomers.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    No customers yet.
                  </Typography>
                ) : null}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Typography gutterBottom variant="h6">
                  Recent orders
                </Typography>
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {(adminData?.recent_orders || []).map((order) => (
                    <Box key={order.id}>
                      <Typography fontWeight={600}>{order.invoice_number}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {order.status}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                {(adminData?.recent_orders || []).length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    No recent orders.
                  </Typography>
                ) : null}
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      ) : null}

      {isAdmin && tab === "products" ? (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper component="form" sx={{ p: 2 }} variant="outlined" onSubmit={handleProductCreate}>
                <Stack spacing={2}>
                  <Typography variant="h6">Add product</Typography>
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={productForm.featured}
                        onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))}
                      />
                    }
                    label="Mark as featured"
                  />
                  <Input
                    label="Description"
                    minRows={5}
                    multiline
                    value={productForm.description}
                    onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                  />
                  <Button type="submit">Create product</Button>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Stack spacing={2}>
                  <Typography variant="h6">Bulk product upload</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Import several products at once.
                  </Typography>
                  <Input minRows={14} multiline value={bulkJson} onChange={(event) => setBulkJson(event.target.value)} />
                  <Button type="button" onClick={handleBulkUpload}>
                    Upload products
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2 }} variant="outlined">
            <Stack spacing={2} sx={{ mb: 2, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}>
              <Box>
                <Typography gutterBottom variant="h6">
                  Current catalog
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Products currently visible in the storefront.
                </Typography>
              </Box>
              <Button type="button" variant="secondary" onClick={refreshCatalog}>
                Refresh catalog
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {catalog.items.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: "100%" }} variant="outlined">
                    <CardActionArea component={Link} to={`/products/${product.id}`}>
                      <CardMedia alt={product.name} component="img" image={product.image} sx={{ height: 180, objectFit: "cover" }} />
                    </CardActionArea>
                    <CardContent>
                      <Stack direction="row" gap={0.5} sx={{ mb: 1, flexWrap: "wrap" }}>
                        <Chip label={product.category} size="small" />
                        <Chip label={product.featured ? "Featured" : "Standard"} size="small" variant="outlined" />
                      </Stack>
                      <Typography component={Link} sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }} to={`/products/${product.id}`} variant="subtitle1">
                        {product.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                        {product.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center", justifyContent: "space-between" }}>
                        <Typography fontWeight={700}>{formatCurrency(product.price)}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Stock {product.stock}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {catalog.items.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
                There are no products in the catalog yet. Use the add product form above.
              </Typography>
            ) : null}
          </Paper>
        </Stack>
      ) : null}

      {isAdmin && tab === "customers" ? (
        <Stack spacing={3}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography gutterBottom variant="h6">
              Customer directory
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Customer accounts in the system.
            </Typography>
          </Paper>
          {adminCustomers.map((customer) => (
            <Paper key={customer.id} sx={{ p: 2 }} variant="outlined">
              <Stack spacing={2} sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box>
                  <Typography fontWeight={600}>{customer.name}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                    {customer.email}
                  </Typography>
                </Box>
                <Chip label={customer.role} size="small" />
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
                Phone: {customer.phone || "Not provided"}
              </Typography>
            </Paper>
          ))}
          {adminCustomers.length === 0 ? <Typography color="text.secondary">No customers available yet.</Typography> : null}
        </Stack>
      ) : null}

      </Stack>
      <Modal isOpen={Boolean(invoice)} title="Invoice Preview" onClose={() => setInvoice("")}>
        <pre>{invoice}</pre>
      </Modal>
    </Container>
  );
}

export default Dashboard;
