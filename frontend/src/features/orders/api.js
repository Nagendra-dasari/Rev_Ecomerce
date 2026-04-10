import apiClient from "../../services/apiClient";

export const fetchOrdersRequest = async () => {
  const { data } = await apiClient.get("/orders");
  return data;
};

export const createOrderRequest = async (payload) => {
  const { data } = await apiClient.post("/orders", payload);
  return data;
};
