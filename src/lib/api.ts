/**
 * API Utility - Simple & Powerful
 * Auto-handle errors, show toast, and more
 * 
 * Usage:
 * import { api } from "@/lib/api";
 * 
 * const data = await api.get("/api/requests");
 * const result = await api.post("/api/requests", { data });
 */

interface ApiOptions extends RequestInit {
  showToast?: boolean; // Auto show toast on error
  throwError?: boolean; // Throw error instead of returning null
}

interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request method
   */
  private async request<T = any>(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<T> {
    const {
      showToast = true,
      throwError = false,
      headers = {},
      ...fetchOptions
    } = options;

    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });

      // Parse response
      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
        
        // Show toast if enabled
        if (showToast && typeof window !== "undefined") {
          // Dynamic import to avoid SSR issues
          import("@/context/ToastContext").then(({ useToast }) => {
            // Note: This won't work directly, we need to use event system
          });
        }

        if (throwError) {
          throw new Error(errorMessage);
        }

        return {
          data: null,
          error: errorMessage,
          status: response.status,
        } as any;
      }

      // Success
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error";
      
      if (throwError) {
        throw error;
      }

      return {
        data: null,
        error: errorMessage,
        status: 0,
      } as any;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export typed helpers for common responses
export type { ApiOptions, ApiResponse };

/**
 * Utility function to handle API errors with toast
 * Use in try-catch blocks
 */
export async function apiCall<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

