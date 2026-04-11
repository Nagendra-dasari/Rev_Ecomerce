import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import rootReducer from "../store/rootReducer";
import { renderWithTheme } from "../test/testUtils";
import Dashboard from "./Dashboard";

jest.mock("../services/storeApi", () => ({
  addAddress: jest.fn(),
  addCartItem: jest.fn(),
  addWishlistItem: jest.fn(),
  bulkCreateProducts: jest.fn(),
  createProduct: jest.fn(),
  getAdminDashboard: jest.fn(() =>
    Promise.resolve({
      metrics: [],
      low_stock_products: [],
      recent_orders: [],
    }),
  ),
  getAllOrders: jest.fn(() => Promise.resolve([])),
  getCart: jest.fn(() => Promise.resolve({ items: [], total_amount: 0 })),
  getInvoice: jest.fn(),
  getNotifications: jest.fn(() => Promise.resolve([])),
  getOrders: jest.fn(() => Promise.resolve([])),
  getProducts: jest.fn(() =>
    Promise.resolve({
      items: [],
      categories: [],
      total: 0,
      total_pages: 1,
      page: 1,
    }),
  ),
  getProfile: jest.fn(),
  getUsers: jest.fn(() => Promise.resolve([])),
  getWishlist: jest.fn(() => Promise.resolve({ items: [], share_code: "" })),
  markNotificationRead: jest.fn(),
  removeWishlistItem: jest.fn(),
  updateOrderStatus: jest.fn(),
  updateProfile: jest.fn(),
}));

import * as storeApi from "../services/storeApi";

function createStore({ role }) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      auth: {
        user: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role,
          phone: "",
        },
        token: "test-token",
        status: "idle",
        error: "",
        resetToken: "",
        resetMessage: "",
      },
      cart: { items: [], totalAmount: 0 },
      products: {
        items: [],
        categories: [],
        total: 0,
        page: 1,
        pageSize: 8,
        totalPages: 1,
        status: "idle",
        error: "",
        filters: { search: "", category: "" },
      },
      orders: { items: [], status: "idle", error: "", checkoutStatus: "idle" },
    },
  });
}

function renderDashboard(store) {
  return renderWithTheme(
    <Provider store={store}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    storeApi.getProfile.mockResolvedValue({
      id: "u1",
      name: "Test User",
      email: "test@example.com",
      role: "customer",
      phone: "",
      addresses: [],
    });
  });

  test("customer workspace loads catalog tab after data resolves", async () => {
    const store = createStore({ role: "customer" });
    renderDashboard(store);

    expect(screen.getByText(/Loading workspace/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Loading workspace/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Customer Workspace/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Shop$/ })).toBeInTheDocument();
    expect(screen.getByText(/Customer catalog/i)).toBeInTheDocument();
  });

  test("admin workspace shows overview-oriented copy", async () => {
    storeApi.getProfile.mockResolvedValue({
      id: "a1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      phone: "",
      addresses: [],
    });
    storeApi.getUsers.mockResolvedValue([
      { id: "c1", name: "Cust", email: "c@x.com", role: "customer", phone: "" },
    ]);

    const store = createStore({ role: "admin" });
    renderDashboard(store);

    await waitFor(() => {
      expect(screen.queryByText(/Loading workspace/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Admin Workspace/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Overview$/ })).toBeInTheDocument();
    expect(screen.getByText(/Manage store operations/i)).toBeInTheDocument();
  });
});
