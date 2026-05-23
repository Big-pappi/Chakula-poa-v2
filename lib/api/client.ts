/**
 * Chakula Poa API Client
 * 
 * Connects the Next.js frontend to the Django backend.
 * 
 * DEVELOPMENT SETUP:
 * 1. Copy .env.example to .env.local
 * 2. Set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
 * 3. Start Django backend: cd backend && python manage.py runserver
 * 4. Start Next.js: npm run dev
 * 
 * PRODUCTION:
 * Set NEXT_PUBLIC_API_URL to your Render.com backend URL
 * Example: NEXT_PUBLIC_API_URL=https://chakula-poa-api.onrender.com
 */

import type { ApiResponse, ApiRequestOptions } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Token management
const TOKEN_KEY = "chakula_poa_access_token";
const REFRESH_TOKEN_KEY = "chakula_poa_refresh_token";
const LEGACY_TOKEN_KEY = "access_token";
const LEGACY_REFRESH_TOKEN_KEY = "refresh_token";

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, accessToken);
    localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  },
};

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      tokenManager.setTokens(data.access, refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Main API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    requiresAuth = true,
  } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add JWT token if authenticated request
  if (requiresAuth) {
    const token = tokenManager.getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requiresAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        const newToken = tokenManager.getAccessToken();
        requestHeaders["Authorization"] = `Bearer ${newToken}`;

        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });

        const retryData = await retryResponse.json().catch(() => null);
        return {
          data: retryResponse.ok ? retryData : undefined,
          status: retryResponse.status,
          error: retryResponse.ok ? undefined : retryData?.detail || retryData?.message || "Request failed",
        };
      } else {
        tokenManager.clearTokens();
        return {
          status: 401,
          error: "Session expired. Please login again.",
        };
      }
    }

    let data = await response.json().catch(() => null);

    // Handle Django REST Framework paginated responses
    // If response has { count, next, previous, results }, extract all data
    if (response.ok && data && typeof data === 'object' && 'results' in data && 'count' in data) {
      // This is a paginated response - fetch all pages
      let allResults = [...data.results];
      let nextUrl = data.next;
      
      // Fetch remaining pages if any
      while (nextUrl) {
        try {
          const nextResponse = await fetch(nextUrl, {
            method: 'GET',
            headers: requestHeaders,
          });
          if (nextResponse.ok) {
            const nextData = await nextResponse.json();
            allResults = [...allResults, ...nextData.results];
            nextUrl = nextData.next;
          } else {
            break;
          }
        } catch {
          break;
        }
      }
      
      // Return the full array as data
      data = allResults;
    }

    // Parse Django REST Framework validation errors
    let errorMessage: string | undefined;
    if (!response.ok && data) {
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === "object") {
        // Handle field-specific errors from DRF serializers
        const fieldErrors: string[] = [];
        for (const [field, errors] of Object.entries(data)) {
          if (Array.isArray(errors)) {
            const fieldName = field.replace(/_/g, " ");
            fieldErrors.push(`${fieldName}: ${errors.join(", ")}`);
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join("; ");
        }
      }
    }

    return {
      data: response.ok ? data : undefined,
      status: response.status,
      error: response.ok ? undefined : errorMessage || "Request failed",
    };
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      status: 0,
      error: "Network error. Please check your connection and make sure Django server is running.",
    };
  }
}

/**
 * API Helper functions
 */
export const api = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: Record<string, unknown>, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(endpoint, { ...options, method: "POST", body }),
  put: <T>(endpoint: string, body?: Record<string, unknown>, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(endpoint, { ...options, method: "PUT", body }),
  patch: <T>(endpoint: string, body?: Record<string, unknown>, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(endpoint, { ...options, method: "PATCH", body }),
  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Auth API functions
 */
export const authAPI = {
  login: async (identifier: string, password: string) => {
    // identifier can be email or phone number
    const response = await apiRequest<{ access: string; refresh: string; user: unknown }>(
      "/api/users/login/",
      { method: "POST", body: { identifier, password }, requiresAuth: false }
    );
    if (response.data) {
      tokenManager.setTokens(response.data.access, response.data.refresh);
    }
    return response;
  },
  
  register: async (data: Record<string, unknown>) => {
    return apiRequest<{ cps_number: string; user: unknown }>(
      "/api/users/register/",
      { method: "POST", body: data, requiresAuth: false }
    );
  },
  
  forgotPassword: async (phone: string) => {
    return apiRequest<{ message: string }>(
      "/api/users/forgot-password/",
      { method: "POST", body: { phone_number: phone }, requiresAuth: false }
    );
  },
  
  resetPassword: async (phone: string, code: string, newPassword: string) => {
    return apiRequest<{ message: string }>(
      "/api/users/reset-password/",
      { method: "POST", body: { phone_number: phone, code, new_password: newPassword }, requiresAuth: false }
    );
  },
  
  logout: () => {
    tokenManager.clearTokens();
  },
  
  getCurrentUser: async () => {
    return apiRequest<{ user: unknown }>("/api/users/me/");
  },
};

export default api;
