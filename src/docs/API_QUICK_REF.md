# ⚡ API Utility - Quick Reference

## 🚀 Import

```typescript
import { useApi } from "@/hooks/useApi";
```

---

## 📋 Basic Usage

```typescript
const api = useApi();

// GET
const data = await api.get("/api/requests");

// POST
const result = await api.post("/api/requests", { data });

// PUT
await api.put("/api/requests/1", { data });

// DELETE
await api.delete("/api/requests/1");
```

---

## 🎨 With Toast

```typescript
// Success toast
await api.post("/api/requests", data, {
  showSuccessToast: true,
  successMessage: "✅ Thành công!",
});

// Custom error message
await api.get("/api/requests", {
  errorMessage: "❌ Không thể tải dữ liệu!",
});

// Disable error toast
await api.get("/api/requests", {
  showErrorToast: false,
});
```

---

## 🎯 Complete Example

```typescript
"use client";

import { useApi } from "@/hooks/useApi";

export default function MyComponent() {
  const api = useApi();

  const handleCreate = async () => {
    const result = await api.post(
      "/api/requests",
      {
        loai_yeu_cau: "Thực phẩm",
        so_nguoi: 50,
      },
      {
        showSuccessToast: true,
        successMessage: "✅ Tạo thành công!",
      }
    );

    if (result) {
      console.log("Created:", result);
    }
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

---

## 💡 With React Query

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
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
  
  return useMutation({
    mutationFn: (data) => api.post("/api/requests", data, {
      showSuccessToast: true,
      successMessage: "✅ Tạo thành công!",
    }),
  });
}
```

---

## ⚙️ Options

```typescript
{
  showSuccessToast?: boolean;    // Show success toast
  showErrorToast?: boolean;      // Show error toast (default: true)
  successMessage?: string;       // Custom success message
  errorMessage?: string;         // Custom error message
  headers?: HeadersInit;         // Custom headers
  signal?: AbortSignal;          // For aborting requests
}
```

---

## 🎯 TypeScript

```typescript
interface MyResponse {
  data: string[];
}

const api = useApi();

const result = await api.get<MyResponse>("/api/endpoint");
// result?.data is typed as string[]
```

---

## ✨ Features

✅ Auto error toast  
✅ Optional success toast  
✅ TypeScript support  
✅ Simple API  
✅ No try-catch needed  
✅ React Query compatible  

---

## 📖 Full Documentation

See `API_UTILITY_GUIDE.md` for complete documentation.

