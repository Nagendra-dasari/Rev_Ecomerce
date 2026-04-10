import apiClient from "../../services/apiClient";

export const fetchProductsRequest = async (params = {}) => {
  const { data } = await apiClient.get("/products", { params });
  return data;
};
