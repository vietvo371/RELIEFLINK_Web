/**
 * useApi Hook - API Utility với Toast Integration
 * 
 * Usage:
 * const api = useApi();
 * 
 * // GET request
 * const data = await api.get("/api/requests");
 * 
 * // POST request
 * const result = await api.post("/api/requests", { data });
 * 
 * // Tự động show toast khi có lỗi!
 */

import { useToast } from "@/context/ToastContext";

interface ApiOptions extends RequestInit {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi() {
  const { success: showSuccess, error: showError } = useToast();

  /**
   * Generic request method
   */
  const request = async <T = any>(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      errorMessage,
      headers = {},
      ...fetchOptions
    } = options;

    try {
      const response = await fetch(endpoint, {
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
        const error = data?.error || data?.message || `Request failed: ${response.status}`;
        
        if (showErrorToast) {
          showError(errorMessage || error);
        }

        throw new Error(error);
      }

      // Success
      if (showSuccessToast && successMessage) {
        showSuccess(successMessage);
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      
      if (showErrorToast && !errorMessage) {
        showError(message);
      }

      throw error;
    }
  };

  /**
   * GET request
   */
  const get = async <T = any>(
    endpoint: string,
    options?: Omit<ApiOptions, "method" | "body">,
  ): Promise<T | null> => {
    try {
      return await request<T>(endpoint, {
        ...options,
        method: "GET",
      });
    } catch {
      return null;
    }
  };

  /**
   * POST request
   */
  const post = async <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, "method">,
  ): Promise<T | null> => {
    try {
      return await request<T>(endpoint, {
        ...options,
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      return null;
    }
  };

  /**
   * PUT request
   */
  const put = async <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, "method">,
  ): Promise<T | null> => {
    try {
      return await request<T>(endpoint, {
        ...options,
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      return null;
    }
  };

  /**
   * PATCH request
   */
  const patch = async <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, "method">,
  ): Promise<T | null> => {
    try {
      return await request<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      return null;
    }
  };

  /**
   * DELETE request
   */
  const del = async <T = any>(
    endpoint: string,
    options?: Omit<ApiOptions, "method" | "body">,
  ): Promise<T | null> => {
    try {
      return await request<T>(endpoint, {
        ...options,
        method: "DELETE",
      });
    } catch {
      return null;
    }
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    request, // For custom requests
  };
}

/**
 * Simplified version - throw errors instead of returning null
 */
export function useApiStrict() {
  const { success: showSuccess, error: showError } = useToast();

  const request = async <T = any>(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<T> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      errorMessage,
      headers = {},
      ...fetchOptions
    } = options;

    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    let data;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = data?.error || data?.message || `Request failed: ${response.status}`;
      
      if (showErrorToast) {
        showError(errorMessage || error);
      }

      throw new Error(error);
    }

    if (showSuccessToast && successMessage) {
      showSuccess(successMessage);
    }

    return data;
  };

  return {
    get: <T = any>(url: string, opts?: Omit<ApiOptions, "method" | "body">) =>
      request<T>(url, { ...opts, method: "GET" }),
    
    post: <T = any>(url: string, body?: any, opts?: Omit<ApiOptions, "method">) =>
      request<T>(url, { ...opts, method: "POST", body: body ? JSON.stringify(body) : undefined }),
    
    put: <T = any>(url: string, body?: any, opts?: Omit<ApiOptions, "method">) =>
      request<T>(url, { ...opts, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    
    patch: <T = any>(url: string, body?: any, opts?: Omit<ApiOptions, "method">) =>
      request<T>(url, { ...opts, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
    
    delete: <T = any>(url: string, opts?: Omit<ApiOptions, "method" | "body">) =>
      request<T>(url, { ...opts, method: "DELETE" }),
  };
}

