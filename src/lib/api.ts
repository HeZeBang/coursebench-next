import axios from "axios";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — unwrap data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let SWR / caller handle errors
    return Promise.reject(error);
  },
);

export default api;
