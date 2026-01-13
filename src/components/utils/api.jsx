import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) {
  console.warn("VITE_API_URL is not set; requests will be sent to the current origin.");
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const url = (config.url || "").toLowerCase();
  const skipAuth = url.includes("/register") || url.includes("/login");
  if (token && !skipAuth) {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else {
    // ensure Authorization is not sent for public endpoints
    if (config.headers && config.headers.Authorization) delete config.headers.Authorization;
  }
  return config;
});

export { publicApi };
export default api;
