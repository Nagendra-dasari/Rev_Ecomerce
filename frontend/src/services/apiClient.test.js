import apiClient from "./apiClient";

describe("apiClient interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("attaches Authorization header when auth token is present", () => {
    localStorage.setItem("nagendra-auth", JSON.stringify({ token: "abc123" }));

    const config = { headers: {}, baseURL: "http://127.0.0.1:8000" };
    const result = apiClient.interceptors.request.handlers[0].fulfilled(config);

    expect(result.headers.Authorization).toBe("Bearer abc123");
  });

  test("clears invalid auth payload and does not attach header", () => {
    localStorage.setItem("nagendra-auth", "{ invalid json");

    const config = { headers: {}, baseURL: "http://127.0.0.1:8000" };
    const result = apiClient.interceptors.request.handlers[0].fulfilled(config);

    expect(localStorage.getItem("nagendra-auth")).toBeNull();
    expect(result.headers.Authorization).toBeUndefined();
  });

  test("retries network requests with alternate localhost host", async () => {
    const config = {
      code: "ERR_NETWORK",
      config: {
        baseURL: "http://localhost:8000",
        url: "/test",
        method: "get",
        __retriedWithAltHost: false,
      },
    };

    const requestMock = jest.spyOn(apiClient, "request").mockResolvedValue({ data: "ok" });
    const result = await apiClient.interceptors.response.handlers[0].rejected(config);

    expect(requestMock).toHaveBeenCalledWith({
      ...config.config,
      baseURL: "http://127.0.0.1:8000",
      __retriedWithAltHost: true,
    });
    expect(result).toEqual({ data: "ok" });
    requestMock.mockRestore();
  });
});
