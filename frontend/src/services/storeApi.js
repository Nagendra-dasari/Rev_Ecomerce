import apiClient from "./apiClient";

export const getProfile = async () => {
  const { data } = await apiClient.get("/users/me");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await apiClient.put("/users/me", payload);
  return data;
};

export const addAddress = async (payload) => {
  const { data } = await apiClient.post("/users/me/addresses", payload);
  return data;
};

export const getUsers = async () => {
  const { data } = await apiClient.get("/users");
  return data;
};

export const getProducts = async (params) => {
  const { data } = await apiClient.get("/products", { params });
  return data;
};

export const getProduct = async (productId) => {
  const { data } = await apiClient.get(`/products/${productId}`);
  return data;
};

export const getLowStockProducts = async () => {
  const { data } = await apiClient.get("/products/low-stock");
  return data;
};

export const bulkCreateProducts = async (products) => {
  const { data } = await apiClient.post("/products/bulk", { products });
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await apiClient.post("/products", payload);
  return data;
};

export const getCart = async () => {
  const { data } = await apiClient.get("/cart");
  return data;
};

export const addCartItem = async (payload) => {
  const { data } = await apiClient.post("/cart", payload);
  return data;
};

export const updateCartItem = async (productId, quantity) => {
  const { data } = await apiClient.put(`/cart/${productId}`, { quantity });
  return data;
};

export const removeCartItem = async (productId) => {
  const { data } = await apiClient.delete(`/cart/${productId}`);
  return data;
};

export const clearCartApi = async () => {
  const { data } = await apiClient.delete("/cart");
  return data;
};

export const getOrders = async () => {
  const { data } = await apiClient.get("/orders");
  return data;
};

export const getAllOrders = async () => {
  const { data } = await apiClient.get("/orders/admin");
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await apiClient.post("/orders", payload);
  return data;
};

export const updateOrderStatus = async (orderId, payload) => {
  const { data } = await apiClient.put(`/orders/${orderId}/status`, payload);
  return data;
};

export const getInvoice = async (orderId) => {
  const { data } = await apiClient.get(`/orders/${orderId}/invoice`);
  return data;
};

export const getReviews = async (productId) => {
  const { data } = await apiClient.get("/reviews", { params: { product_id: productId } });
  return data;
};

export const createReview = async (payload) => {
  const { data } = await apiClient.post("/reviews", payload);
  return data;
};

export const voteReviewHelpful = async (reviewId) => {
  const { data } = await apiClient.post(`/reviews/${reviewId}/helpful`);
  return data;
};

export const getWishlist = async () => {
  const { data } = await apiClient.get("/wishlist");
  return data;
};

export const addWishlistItem = async (productId) => {
  const { data } = await apiClient.post(`/wishlist/${productId}`);
  return data;
};

export const removeWishlistItem = async (productId) => {
  const { data } = await apiClient.delete(`/wishlist/${productId}`);
  return data;
};

export const getNotifications = async () => {
  const { data } = await apiClient.get("/notifications");
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await apiClient.put(`/notifications/${notificationId}/read`);
  return data;
};

export const getAdminDashboard = async () => {
  const { data } = await apiClient.get("/admin/dashboard");
  return data;
};
