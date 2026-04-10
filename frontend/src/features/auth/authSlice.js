import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { confirmPasswordReset, loginRequest, registerRequest, requestPasswordReset } from "./api";
import { normalizeApiError } from "../../utils/apiError";

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem("nagendra-auth") || "null");
  } catch {
    localStorage.removeItem("nagendra-auth");
    return null;
  }
}

const savedAuth = readStoredAuth();

const initialState = {
  user: savedAuth?.user || null,
  token: savedAuth?.token || "",
  status: "idle",
  error: "",
  resetToken: "",
  resetMessage: "",
};

export const loginUser = createAsyncThunk("auth/loginUser", async (payload, thunkApi) => {
  try {
    return await loginRequest(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeApiError(error, "Unable to log in"));
  }
});

export const registerUser = createAsyncThunk("auth/registerUser", async (payload, thunkApi) => {
  try {
    return await registerRequest(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeApiError(error, "Unable to register"));
  }
});

export const requestResetToken = createAsyncThunk("auth/requestResetToken", async (payload, thunkApi) => {
  try {
    return await requestPasswordReset(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeApiError(error, "Unable to generate reset token"));
  }
});

export const confirmResetPassword = createAsyncThunk("auth/confirmResetPassword", async (payload, thunkApi) => {
  try {
    return await confirmPasswordReset(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeApiError(error, "Unable to reset password"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = "";
      state.error = "";
      state.resetToken = "";
      state.resetMessage = "";
      localStorage.removeItem("nagendra-auth");
    },
    setSession(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("nagendra-auth", JSON.stringify({ user: state.user, token: state.token }));
    },
    clearResetState(state) {
      state.resetToken = "";
      state.resetMessage = "";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
        state.resetMessage = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        localStorage.setItem("nagendra-auth", JSON.stringify({ user: state.user, token: state.token }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
        state.resetMessage = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        localStorage.setItem("nagendra-auth", JSON.stringify({ user: state.user, token: state.token }));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(requestResetToken.pending, (state) => {
        state.status = "loading";
        state.error = "";
        state.resetMessage = "";
      })
      .addCase(requestResetToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resetToken = action.payload.reset_token;
        state.resetMessage = action.payload.message;
      })
      .addCase(requestResetToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(confirmResetPassword.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(confirmResetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resetMessage = action.payload.message;
        state.resetToken = "";
      })
      .addCase(confirmResetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, setSession, clearResetState } = authSlice.actions;
export default authSlice.reducer;
