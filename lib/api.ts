import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization && typeof window !== "undefined") {
    const studentToken = localStorage.getItem("studentToken");
    const adminToken = localStorage.getItem("token");
    const token = studentToken || adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
