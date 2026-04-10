export function normalizeApiError(error, fallbackMessage = "Something went wrong") {
  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach backend API. Check backend is running on port 8000 and VITE_API_BASE_URL is correct.";
  }

  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .filter(Boolean)
      .join(", ");
  }

  if (detail && typeof detail === "object") {
    return detail.msg || detail.message || JSON.stringify(detail);
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
