# 🚀 API Utility Guide - RELIEFLINK

## ✨ API Utility Siêu Đơn Giản!

Không cần viết fetch thủ công nữa. Chỉ cần `api.get()`, `api.post()` và done! 🎉

---

## 📦 Import

```typescript
import { useApi } from "@/hooks/useApi";
```

---

## 🎯 Cách Sử Dụng Cơ Bản

### **1. GET Request**

```typescript
const MyComponent = () => {
  const api = useApi();

  const fetchData = async () => {
    const data = await api.get("/api/requests");
    console.log(data);
  };

  return <button onClick={fetchData}>Load Data</button>;
};
```

### **2. POST Request**

```typescript
const createRequest = async () => {
  const api = useApi();
  
  const newRequest = await api.post("/api/requests", {
    loai_yeu_cau: "Thực phẩm",
    so_nguoi: 50,
    do_uu_tien: "cao",
  });
  
  // Tự động show toast nếu có lỗi!
};
```

### **3. PUT Request**

```typescript
const updateRequest = async (id: number) => {
  const api = useApi();
  
  await api.put(`/api/requests/${id}`, {
    trang_thai: "hoan_thanh",
  });
};
```

### **4. DELETE Request**

```typescript
const deleteRequest = async (id: number) => {
  const api = useApi();
  
  await api.delete(`/api/requests/${id}`);
};
```

---

## 🎨 Với Toast Messages

### **Auto Show Success Toast**

```typescript
const api = useApi();

await api.post(
  "/api/requests",
  { data },
  {
    showSuccessToast: true,
    successMessage: "✅ Tạo yêu cầu thành công!",
  }
);
```

### **Custom Error Message**

```typescript
const api = useApi();

await api.get("/api/requests", {
  errorMessage: "❌ Không thể tải danh sách yêu cầu!",
});
```

### **Disable Error Toast**

```typescript
const api = useApi();

await api.get("/api/requests", {
  showErrorToast: false, // Không hiện toast lỗi
});
```

---

## 💡 Với React Query

### **Example: useRequests Hook**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";

export function useRequests() {
  const api = useApi();

  return useQuery({
    queryKey: ["requests"],
    queryFn: () => api.get("/api/requests"),
  });
}

export function useCreateRequest() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      api.post("/api/requests", data, {
        showSuccessToast: true,
        successMessage: "✅ Tạo thành công!",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}
```

---

## 🔥 Ví Dụ Thực Tế

### **Example 1: Component với useApi**

```typescript
"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";

export default function CreateRequestForm() {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loai_yeu_cau: "",
    so_nguoi: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await api.post(
      "/api/requests",
      formData,
      {
        showSuccessToast: true,
        successMessage: "✅ Tạo yêu cầu thành công!",
        errorMessage: "❌ Không thể tạo yêu cầu!",
      }
    );

    if (result) {
      // Success
      setFormData({ loai_yeu_cau: "", so_nguoi: "" });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.loai_yeu_cau}
        onChange={(e) => setFormData({ ...formData, loai_yeu_cau: e.target.value })}
        placeholder="Loại yêu cầu"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Đang tạo..." : "Tạo yêu cầu"}
      </button>
    </form>
  );
}
```

### **Example 2: Load Data on Mount**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

export default function RequestsList() {
  const api = useApi();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const data = await api.get("/api/requests");
    if (data?.requests) {
      setRequests(data.requests);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {requests.map((req: any) => (
        <div key={req.id}>{req.loai_yeu_cau}</div>
      ))}
    </div>
  );
}
```

### **Example 3: Delete với Confirmation**

```typescript
const handleDelete = async (id: number) => {
  if (confirm("Bạn có chắc muốn xóa?")) {
    const result = await api.delete(`/api/requests/${id}`, {
      showSuccessToast: true,
      successMessage: "✅ Xóa thành công!",
    });

    if (result) {
      // Refresh list
      loadRequests();
    }
  }
};
```

---

## 🎛️ API Options

### **Available Options:**

```typescript
interface ApiOptions {
  // Toast Options
  showSuccessToast?: boolean;     // Show success toast (default: false)
  showErrorToast?: boolean;        // Show error toast (default: true)
  successMessage?: string;         // Custom success message
  errorMessage?: string;           // Custom error message

  // Fetch Options (standard)
  headers?: HeadersInit;
  signal?: AbortSignal;
  // ... all standard fetch options
}
```

---

## 🔄 All Methods

### **GET**
```typescript
api.get<T>(url: string, options?: ApiOptions): Promise<T | null>
```

### **POST**
```typescript
api.post<T>(url: string, body?: any, options?: ApiOptions): Promise<T | null>
```

### **PUT**
```typescript
api.put<T>(url: string, body?: any, options?: ApiOptions): Promise<T | null>
```

### **PATCH**
```typescript
api.patch<T>(url: string, body?: any, options?: ApiOptions): Promise<T | null>
```

### **DELETE**
```typescript
api.delete<T>(url: string, options?: ApiOptions): Promise<T | null>
```

---

## 🎯 TypeScript Support

### **Type-safe Requests:**

```typescript
interface Request {
  id: number;
  loai_yeu_cau: string;
  so_nguoi: number;
}

interface RequestsResponse {
  requests: Request[];
}

const api = useApi();

// Type-safe GET
const data = await api.get<RequestsResponse>("/api/requests");
console.log(data?.requests); // TypeScript knows this is Request[]

// Type-safe POST
const newRequest = await api.post<{ request: Request }>(
  "/api/requests",
  { loai_yeu_cau: "Food", so_nguoi: 50 }
);
console.log(newRequest?.request.id);
```

---

## ⚡ Advanced Usage

### **1. Custom Headers**

```typescript
const api = useApi();

await api.get("/api/requests", {
  headers: {
    "Authorization": "Bearer token123",
    "X-Custom-Header": "value",
  },
});
```

### **2. AbortController (Cancel Request)**

```typescript
const controller = new AbortController();

api.get("/api/requests", {
  signal: controller.signal,
});

// Cancel request
controller.abort();
```

### **3. With Query Params**

```typescript
const api = useApi();

// Option 1: Manual
const params = new URLSearchParams({ status: "pending" });
await api.get(`/api/requests?${params}`);

// Option 2: Helper function
const buildUrl = (base: string, params: Record<string, string>) => {
  const query = new URLSearchParams(params);
  return `${base}?${query}`;
};

await api.get(buildUrl("/api/requests", { 
  status: "pending", 
  priority: "high" 
}));
```

---

## 🆚 useApi vs useApiStrict

### **useApi (Default) - Returns null on error**

```typescript
const api = useApi();

const data = await api.get("/api/requests");

if (data) {
  // Success
  console.log(data);
} else {
  // Error (toast already shown)
  console.log("Request failed");
}
```

### **useApiStrict - Throws error**

```typescript
import { useApiStrict } from "@/hooks/useApi";

const api = useApiStrict();

try {
  const data = await api.get("/api/requests");
  console.log(data); // Always has data
} catch (error) {
  // Handle error
  console.error(error);
}
```

---

## 📊 Comparison

### **Before (Manual Fetch):**

```typescript
const handleSubmit = async () => {
  try {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      showError(error.message);
      return;
    }

    const result = await res.json();
    showSuccess("Tạo thành công!");
    return result;
  } catch (error) {
    showError("Network error");
  }
};
```

### **After (With useApi):**

```typescript
const api = useApi();

const handleSubmit = async () => {
  await api.post("/api/requests", data, {
    showSuccessToast: true,
    successMessage: "Tạo thành công!",
  });
  // That's it! 🎉
};
```

**Giảm từ 20 dòng → 5 dòng!** 🚀

---

## 🎓 Best Practices

### **DO ✅**

```typescript
// 1. Use with React Query
export function useRequests() {
  const api = useApi();
  return useQuery({
    queryKey: ["requests"],
    queryFn: () => api.get("/api/requests"),
  });
}

// 2. Type-safe
const data = await api.get<MyType>("/api/endpoint");

// 3. Custom messages for important actions
await api.delete(`/api/requests/${id}`, {
  showSuccessToast: true,
  successMessage: "✅ Đã xóa yêu cầu!",
});
```

### **DON'T ❌**

```typescript
// 1. Don't use in server components (SSR)
// useApi() only works in client components

// 2. Don't ignore error handling completely
const data = await api.get("/api/requests");
// Check if data exists before using!

// 3. Don't overuse success toasts
await api.get("/api/requests", {
  showSuccessToast: true, // ❌ Not needed for GET
});
```

---

## 🔄 Migration Guide

### **Step 1: Replace fetch với useApi**

**Old:**
```typescript
const res = await fetch("/api/requests");
const data = await res.json();
```

**New:**
```typescript
const api = useApi();
const data = await api.get("/api/requests");
```

### **Step 2: Remove manual error handling**

**Old:**
```typescript
try {
  const res = await fetch("/api/requests", { method: "POST", ... });
  if (!res.ok) throw new Error("Failed");
  showSuccess("Success!");
} catch {
  showError("Error!");
}
```

**New:**
```typescript
const api = useApi();
await api.post("/api/requests", data, {
  showSuccessToast: true,
  successMessage: "Success!",
});
```

---

## 🎉 Summary

### **Tính năng:**

✅ **Siêu đơn giản** - `api.get()`, `api.post()`, done!  
✅ **Auto toast** - Tự động show error toast  
✅ **Type-safe** - Full TypeScript support  
✅ **Flexible** - Custom headers, abort, options  
✅ **React Query friendly** - Hoạt động hoàn hảo  
✅ **No boilerplate** - Không cần viết try-catch  
✅ **Consistent** - API nhất quán trong toàn app  

---

## 🚀 Quick Start

```typescript
// 1. Import
import { useApi } from "@/hooks/useApi";

// 2. Use
const MyComponent = () => {
  const api = useApi();

  const loadData = () => api.get("/api/requests");
  const createData = (data: any) => api.post("/api/requests", data);
  const updateData = (id: number, data: any) => api.put(`/api/requests/${id}`, data);
  const deleteData = (id: number) => api.delete(`/api/requests/${id}`);

  // That's it! 🎉
};
```

---

**Enjoy coding with less boilerplate! 🚀**

