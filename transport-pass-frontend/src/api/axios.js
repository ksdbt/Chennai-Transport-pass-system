import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

// 🔑 Attach to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/refresh", {accessToken: refreshToken });
          localStorage.setItem("accessToken", res.data.accessToken);
          error.config.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
          return api.request(error.config);
        } catch (err) {
          console.error("Refresh token failed", err);
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
