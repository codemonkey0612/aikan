import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { AuthAPI } from "./endpoints";

const API_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_KEY = "nursingSystem.accessToken";
const REFRESH_TOKEN_KEY = "nursingSystem.refreshToken";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Initialize tokens from localStorage
const initTokens = () => {
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (accessToken) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
  }
};

initTokens();

// Process queued requests after token refresh
const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor: Add token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // FormDataの場合はContent-Typeを自動設定させる（boundaryを含む）
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors and auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401エラーで、リフレッシュトークンがある場合、自動リフレッシュ
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      if (isRefreshing) {
        // 既にリフレッシュ中の場合、キューに追加
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            if (accessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await AuthAPI.refresh({ refreshToken });
        setTokens(response.accessToken, response.refreshToken);
        processQueue(null);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearTokens();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // リフレッシュトークンがない、またはリフレッシュに失敗した場合
    if (error.response?.status === 401) {
      clearTokens();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const setTokens = (access: string | null, refresh: string | null) => {
  accessToken = access;
  refreshToken = refresh;
  if (access) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
    }
    apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
  } else {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    delete apiClient.defaults.headers.common.Authorization;
  }

  if (refresh) {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  } else {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};

export const clearTokens = () => {
  setTokens(null, null);
};

export const getAuthToken = () => {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return accessToken;
};

export const getRefreshToken = () => {
  if (!refreshToken && typeof window !== "undefined") {
    refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return refreshToken;
};

// 後方互換性のため
export const setAuthToken = (token: string | null) => {
  setTokens(token, refreshToken);
};

export type ApiIdentifier = number | string;

