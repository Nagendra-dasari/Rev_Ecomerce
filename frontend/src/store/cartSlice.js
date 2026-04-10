import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalAmount: 0,
  },
  reducers: {
    setCart(state, action) {
      state.items = action.payload.items || [];
      state.totalAmount = action.payload.total_amount || 0;
    },
    resetCart(state) {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { setCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
