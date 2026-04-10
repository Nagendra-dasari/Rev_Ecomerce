import apiClient from "../../services/apiClient";

export const loginRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};

export const registerRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

export const requestPasswordReset = async (payload) => {
  const { data } = await apiClient.post("/auth/password-reset/request", payload);
  return data;
};

export const confirmPasswordReset = async (payload) => {
  const { data } = await apiClient.post("/auth/password-reset/confirm", payload);
  return data;
};
