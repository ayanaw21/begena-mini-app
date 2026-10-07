import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

const isPlaceholder = (value?: unknown) =>
  !value ||
  value === "Bearer null" ||
  value === "Bearer undefined" ||
  value === "Bearer ";

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  // Call sites often pass an explicit header built from localStorage, which becomes
  // the literal string "Bearer null" when no token is stored.
  if (isPlaceholder(config.headers.Authorization)) {
    const token =
      localStorage.getItem("studentToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") return Promise.reject(error);

    const status = error.response?.status;
    const path = window.location.pathname;
    const onLoginPage = path.endsWith("/login");

    if (status === 401 && !onLoginPage) {
      const isStudentArea = path.startsWith("/student");
      localStorage.removeItem(isStudentArea ? "studentToken" : "token");
      window.location.href = isStudentArea
        ? "/student/login"
        : "/admin/login";
    }

    return Promise.reject(error);
  }
);

export default api;
