# 🎨 Toast Notification Guide - RELIEFLINK

## ✅ Đã Cài Đặt Xong!

Toast notification system đã được tích hợp hoàn toàn vào RELIEFLINK.

---

## 🚀 Cách Sử Dụng

### **1️⃣ Import useToast Hook**

```typescript
import { useToast } from "@/context/ToastContext";
```

### **2️⃣ Sử Dụng trong Component**

```typescript
export default function MyComponent() {
  const { success, error, warning, info } = useToast();

  const handleClick = () => {
    success("✅ Thao tác thành công!");
  };

  const handleError = () => {
    error("❌ Có lỗi xảy ra!");
  };

  return (
    <button onClick={handleClick}>Click me</button>
  );
}
```

---

## 📋 Các Loại Toast

### **1. Success Toast (Thành công)**
```typescript
success("✅ Tạo yêu cầu thành công!");
success("🎉 Đăng nhập thành công!");
success("💾 Lưu dữ liệu thành công!", 3000); // 3 giây
```

### **2. Error Toast (Lỗi)**
```typescript
error("❌ Không thể kết nối database");
error("⚠️ Email đã tồn tại");
error("🚫 Không có quyền truy cập", 5000);
```

### **3. Warning Toast (Cảnh báo)**
```typescript
warning("⚡ Hành động này không thể hoàn tác");
warning("📝 Vui lòng điền đầy đủ thông tin");
```

### **4. Info Toast (Thông tin)**
```typescript
info("ℹ️ Đang xử lý yêu cầu...");
info("📊 Dữ liệu đã được cập nhật");
```

---

## 🎯 Ví Dụ Thực Tế

### **Example 1: Form Submit**

```typescript
"use client";

import { useToast } from "@/context/ToastContext";

export default function CreateRequestForm() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      success("✅ Tạo yêu cầu cứu trợ thành công!");
    } catch (err) {
      error(err.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### **Example 2: Delete Action**

```typescript
const handleDelete = async (id: number) => {
  warning("Đang xóa...");

  try {
    const res = await fetch(`/api/requests/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Xóa thất bại");

    success("✅ Xóa thành công!");
  } catch (err) {
    error("❌ Không thể xóa yêu cầu này");
  }
};
```

### **Example 3: với React Query**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      success("✅ Tạo yêu cầu thành công!");
    },
    onError: (err: Error) => {
      error(err.message || "Có lỗi xảy ra!");
    },
  });
}
```

---

## ⚙️ Tùy Chỉnh Thời Gian Hiển Thị

```typescript
const { success, error } = useToast();

// Mặc định: 5 giây
success("Default duration");

// Custom duration: 3 giây
success("Quick message", 3000);

// Hiển thị lâu: 10 giây
error("Important error", 10000);

// Không tự động đóng: 0
warning("Manual close only", 0);
```

---

## 🎨 Kiểu Toast & Màu Sắc

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `success` | 🟢 Green | ✓ | Thành công, hoàn tất |
| `error` | 🔴 Red | ✕ | Lỗi, thất bại |
| `warning` | 🟡 Yellow | ⚠ | Cảnh báo, chú ý |
| `info` | 🔵 Blue | ℹ | Thông tin, hướng dẫn |

---

## 🔄 Đã Tích Hợp Sẵn

Toast đã được tích hợp vào các hook sau:

### **✅ useRequests**
- Tự động hiện toast khi tạo/cập nhật yêu cầu
- Hiện lỗi nếu API fail

### **✅ Login Page**
- Toast khi đăng nhập thành công
- Toast khi đăng ký thành công
- Toast khi có lỗi authentication

### **🔜 Có thể thêm vào:**
- useResources
- useDistributions
- useAI
- useBlockchain

---

## 🎭 Toast Features

✅ **Auto-dismiss** - Tự động đóng sau thời gian cài đặt  
✅ **Manual close** - Có nút X để đóng thủ công  
✅ **Smooth animations** - Animation mượt mà  
✅ **Dark mode support** - Hỗ trợ dark mode  
✅ **Stack multiple toasts** - Hiển thị nhiều toast cùng lúc  
✅ **Type safety** - TypeScript types đầy đủ  
✅ **Customizable duration** - Tùy chỉnh thời gian  
✅ **No dependencies** - Không cần library bên ngoài  

---

## 🔧 API Reference

### **useToast Hook**

```typescript
const {
  toasts,        // Array of current toasts
  addToast,      // Add custom toast
  removeToast,   // Remove toast by ID
  success,       // Show success toast
  error,         // Show error toast
  warning,       // Show warning toast
  info,          // Show info toast
} = useToast();
```

### **Function Signatures**

```typescript
type ToastType = "success" | "error" | "warning" | "info";

success(message: string, duration?: number): void
error(message: string, duration?: number): void
warning(message: string, duration?: number): void
info(message: string, duration?: number): void

addToast(type: ToastType, message: string, duration?: number): void
removeToast(id: string): void
```

---

## 💡 Best Practices

### **DO ✅**

```typescript
// Clear, concise messages
success("Lưu thành công!");
error("Email không hợp lệ");

// Use emojis for clarity
success("✅ Tạo thành công!");
error("❌ Xóa thất bại");

// Specific error messages
error("Không thể kết nối database");
```

### **DON'T ❌**

```typescript
// Too long messages
error("An unexpected error occurred while trying to save your data to the database. Please try again later or contact support if the problem persists.");

// Generic messages
error("Error");
success("OK");

// Multiple toasts for same action
success("Saving...");
success("Almost done...");
success("Done!"); // Too many!
```

---

## 🐛 Troubleshooting

### **Toast không hiển thị?**

1. Check ToastProvider đã wrap app chưa:
```typescript
// src/app/layout.tsx
<ToastProvider>
  <QueryProvider>{children}</QueryProvider>
</ToastProvider>
```

2. Check import đúng:
```typescript
import { useToast } from "@/context/ToastContext";
```

3. Check z-index (toast ở z-[9999]):
```css
/* Toast should be on top */
z-index: 9999;
```

---

## 🎓 Examples trong Code

### **Đã implement:**

1. **Login Page** (`src/app/page.tsx`)
   - Success on login/register
   - Error on auth fail

2. **useRequests Hook** (`src/hooks/useRequests.ts`)
   - Success on create/update
   - Error on API fail

### **Có thể thêm:**

```typescript
// src/hooks/useResources.ts
export function useCreateResource() {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: createResourceFn,
    onSuccess: () => success("✅ Thêm nguồn lực thành công!"),
    onError: (err) => error(err.message),
  });
}
```

---

## 🚀 Quick Start

### **1. Import hook**
```typescript
import { useToast } from "@/context/ToastContext";
```

### **2. Use in component**
```typescript
const { success, error } = useToast();
```

### **3. Show toast**
```typescript
success("It works! 🎉");
```

---

## ✨ That's It!

Toast system đã sẵn sàng sử dụng!

**Mọi API error sẽ tự động hiển thị toast** trong các hook đã cập nhật.

Happy coding! 🚀

