import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: backendUrl + "/api/v1",
  withCredentials: true,
});
