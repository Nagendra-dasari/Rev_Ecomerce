import axios from "axios";

const defaultApiBaseUrl = "http://127.0.0.1:8000/api/v1";
const configuredBaseUrl = globalThis.__APP_CONFIG__?.VITE_API_BASE_URL || defaultApiBaseUrl;
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  let auth = null;
  try {
    auth = JSON.parse(localStorage.getItem("nagendra-auth") || "null");
  } catch {
    localStorage.removeItem("nagendra-auth");
  }
  config.headers = config.headers || {};
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const shouldRetry =
      error?.code === "ERR_NETWORK" &&
      error?.config &&
      !error.config.__retriedWithAltHost &&
      typeof error.config.baseURL === "string";
    if (!shouldRetry) {
      return Promise.reject(error);
    }

    const baseURL = error.config.baseURL;
    let altBaseUrl = "";
    if (baseURL.includes("localhost")) {
      altBaseUrl = baseURL.replace("localhost", "127.0.0.1");
    } else if (baseURL.includes("127.0.0.1")) {
      altBaseUrl = baseURL.replace("127.0.0.1", "localhost");
    }

    if (!altBaseUrl) {
      return Promise.reject(error);
    }

    return apiClient.request({
      ...error.config,
      baseURL: altBaseUrl,
      __retriedWithAltHost: true,
    });
  },
);

export default apiClient;
