import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { createOrderRequest, fetchOrdersRequest } from "./api";
import { normalizeApiError } from "../../utils/apiError";

const initialState = {
  items: [],
  status: "idle",
  error: "",
  checkoutStatus: "idle",
};

export const fetchOrders = createAsyncThunk("orders/fetchOrders", async (_, thunkApi) => {
  try {
    return await fetchOrdersRequest();
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeApiError(error, "Unable to fetch orders"));
  }
});

export const createOrder = createAsyncThunk("orders/createOrder", async (payload, thunkApi) => {
  try {
    return await createOrderRequest(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeApiError(error, "Unable to create order"));
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.checkoutStatus = "loading";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        state.items = [action.payload, ...state.items];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default ordersSlice.reducer;
