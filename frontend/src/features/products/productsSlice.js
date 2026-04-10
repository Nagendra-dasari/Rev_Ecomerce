import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetchProductsRequest } from "./api";
import { normalizeApiError } from "../../utils/apiError";

const initialState = {
  items: [],
  categories: [],
  total: 0,
  page: 1,
  pageSize: 8,
  totalPages: 1,
  status: "idle",
  error: "",
  filters: {
    search: "",
    category: "",
  },
};

export const fetchProducts = createAsyncThunk("products/fetchProducts", async (params, thunkApi) => {
  try {
    return await fetchProductsRequest(params);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeApiError(error, "Unable to fetch products"));
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.categories = action.payload.categories || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.pageSize = action.payload.page_size || 8;
        state.totalPages = action.payload.total_pages || 1;
        state.error = "";
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setFilters } = productsSlice.actions;
export default productsSlice.reducer;
