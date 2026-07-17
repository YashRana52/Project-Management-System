import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: backendUrl + "/api/v1",
  withCredentials: true,
});

// 🔑 Add this interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
