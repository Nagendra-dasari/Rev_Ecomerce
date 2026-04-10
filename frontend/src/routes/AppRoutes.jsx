import React from "react";

import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "../components/layout/Navbar";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Product from "../pages/Product";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import LoginPage from "../features/auth/pages/LoginPage";

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<Product />} path="/products/:productId" />
        <Route element={<Cart />} path="/cart" />
        <Route
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
          path="/checkout"
        />
        <Route
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
          path="/dashboard"
        />
      </Routes>
    </div>
  );
}

export default AppRoutes;
