import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import API_CONFIG from "../config/api.config";
import SecureStorage from "./secureStorage";
import { ApiResponse } from "../types/api";

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
}

export class ApiClientError extends Error {
  statusCode: number;
  data?: any;
  isNetworkError: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    data?: any,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

let unauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  unauthorizedCallback = callback;
};

/**
 * Pre-configured Axios instance with base URL, timeout, and custom interceptors
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Injects Bearer token from SecureStorage
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const skipAuth = (config as any).skipAuth;

    if (!skipAuth) {
      try {
        const token = await SecureStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn("[ApiClient] Failed to retrieve auth token for request", e);
      }
    }

    // Allow multipart upload boundary setting
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Translates errors and handles 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // 1. Server returned error response (4xx, 5xx)
    if (error.response) {
      const status = error.response.status;
      const responseData: any = error.response.data;

      // Handle 401 Unauthorized: clear storage and invoke logout handler
      if (status === 401) {
        console.warn(
          `[ApiClient] 401 Unauthorized encountered on ${error.config?.method?.toUpperCase()} ${error.config?.url}`
        );
        try {
          await SecureStorage.removeToken();
        } catch (e) {
          console.warn("[ApiClient] Error clearing token on 401", e);
        }
        if (unauthorizedCallback) {
          unauthorizedCallback();
        }
      }

      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        `Request failed with HTTP status ${status}`;

      return Promise.reject(
        new ApiClientError(errorMessage, status, responseData, false)
      );
    }

    // 2. Request timed out
    if (
      error.code === "ECONNABORTED" ||
      error.message?.toLowerCase().includes("timeout")
    ) {
      return Promise.reject(
        new ApiClientError(
          `Request timed out after ${API_CONFIG.TIMEOUT_MS / 1000}s. Please check your network connection.`,
          408,
          undefined,
          true
        )
      );
    }

    // 3. Network or connection error (server offline / no internet)
    return Promise.reject(
      new ApiClientError(
        error.message ||
          "Network request failed. Is the DentaCare server reachable?",
        0,
        undefined,
        true
      )
    );
  }
);

/**
 * Standardized API client wrapping the Axios instance
 */
export const apiClient = {
  async request<T = any>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { skipAuth, headers, params, data, timeout, ...rest } = options;

    const response = await axiosInstance.request<any>({
      url: endpoint,
      method,
      headers,
      params,
      data,
      timeout,
      ...rest,
      ...({ skipAuth } as any),
    });

    const resData = response.data;

    // If server response already follows { success: boolean, data: T } contract
    if (resData && typeof resData === "object" && "success" in resData) {
      return resData as ApiResponse<T>;
    }

    return {
      success: true,
      data: resData as T,
    };
  },

  get<T = any>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, "GET", options);
  },

  post<T = any>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, "POST", { ...options, data: body });
  },

  put<T = any>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, "PUT", { ...options, data: body });
  },

  patch<T = any>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, "PATCH", { ...options, data: body });
  },

  delete<T = any>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, "DELETE", options);
  },
};

export default apiClient;
