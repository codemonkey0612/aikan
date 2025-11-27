import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "nursingSystem.jwt";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

let authToken: string | null = null;

// Initialize token from localStorage
const initToken = () => {
  if (typeof window !== "undefined") {
    authToken = localStorage.getItem(TOKEN_KEY);
    if (authToken) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    }
  }
};

initToken();

// Request interceptor: Add token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors (unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const getAuthToken = () => {
  if (!authToken && typeof window !== "undefined") {
    authToken = localStorage.getItem(TOKEN_KEY);
  }
  return authToken;
};

export type ApiIdentifier = number | string;

