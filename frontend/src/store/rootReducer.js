import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import productsReducer from "../features/products/productsSlice";
import ordersReducer from "../features/orders/ordersSlice";
import cartReducer from "./cartSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  orders: ordersReducer,
  cart: cartReducer,
});

export default rootReducer;
