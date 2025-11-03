# ✅ API Utility - Setup Complete!

## 🎉 Đã Cài Đặt Xong!

API Utility siêu đơn giản đã sẵn sàng sử dụng!

---

## 📦 Files Đã Tạo

### **1. Core Files:**

✅ **`src/lib/api.ts`** - Base API client (standalone)  
✅ **`src/hooks/useApi.ts`** - React hook với Toast integration  
✅ **`src/hooks/useRequests.v2.ts`** - Example hook using useApi  

### **2. Demo & Examples:**

✅ **`src/components/relief/ApiDemo.tsx`** - Demo component  
✅ **`API_UTILITY_GUIDE.md`** - Complete documentation  
✅ **`API_QUICK_REF.md`** - Quick reference card  

---

## 🚀 Sử Dụng Ngay

### **Basic Example:**

```typescript
import { useApi } from "@/hooks/useApi";

export default function MyComponent() {
  const api = useApi();

  const loadData = async () => {
    // Siêu đơn giản!
    const data = await api.get("/api/requests");
    console.log(data);
  };

  const createData = async () => {
    await api.post(
      "/api/requests", 
      { loai_yeu_cau: "Food", so_nguoi: 50 },
      {
        showSuccessToast: true,
        successMessage: "✅ Tạo thành công!"
      }
    );
  };

  return (
    <>
      <button onClick={loadData}>Load</button>
      <button onClick={createData}>Create</button>
    </>
  );
}
```

---

## ✨ Tính Năng

### **1. Siêu Đơn Giản**
```typescript
// Trước (20 dòng code)
try {
  const res = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error();
  const result = await res.json();
  showSuccess("Success!");
} catch {
  showError("Error!");
}

// Bây giờ (1 dòng)
await api.post("/api/requests", data, {
  showSuccessToast: true,
  successMessage: "Success!"
});
```

### **2. Auto Error Toast**
- Tự động hiện toast khi API fail
- Không cần try-catch
- Không cần manual error handling

### **3. Optional Success Toast**
- Show success message khi cần
- Customizable message
- Easy to use

### **4. TypeScript Support**
```typescript
interface MyResponse {
  data: string[];
}

const result = await api.get<MyResponse>("/api/endpoint");
// Full type safety!
```

### **5. React Query Friendly**
```typescript
export function useRequests() {
  const api = useApi();
  return useQuery({
    queryKey: ["requests"],
    queryFn: () => api.get("/api/requests"),
  });
}
```

---

## 📊 So Sánh

| Feature | Manual Fetch | useApi |
|---------|--------------|--------|
| Lines of code | ~20 | ~5 |
| Error handling | Manual try-catch | Auto |
| Toast | Manual | Auto |
| TypeScript | Manual types | Built-in |
| Consistency | Varies | Consistent |

---

## 🎯 Methods Available

| Method | Usage |
|--------|-------|
| `api.get(url, options?)` | GET request |
| `api.post(url, body?, options?)` | POST request |
| `api.put(url, body?, options?)` | PUT request |
| `api.patch(url, body?, options?)` | PATCH request |
| `api.delete(url, options?)` | DELETE request |

---

## 🎨 Toast Options

```typescript
{
  showSuccessToast?: boolean;    // Show success toast
  showErrorToast?: boolean;      // Show error toast (default: true)
  successMessage?: string;       // Custom success message
  errorMessage?: string;         // Custom error message
}
```

---

## 💡 Examples

### **Example 1: Simple GET**
```typescript
const api = useApi();
const data = await api.get("/api/requests");
```

### **Example 2: POST with Toast**
```typescript
const api = useApi();
await api.post("/api/requests", data, {
  showSuccessToast: true,
  successMessage: "✅ Created!"
});
```

### **Example 3: Custom Error Message**
```typescript
const api = useApi();
await api.get("/api/requests", {
  errorMessage: "❌ Cannot load data!"
});
```

### **Example 4: With React Query**
```typescript
export function useCreateRequest() {
  const api = useApi();
  return useMutation({
    mutationFn: (data) => api.post("/api/requests", data, {
      showSuccessToast: true,
      successMessage: "✅ Success!"
    }),
  });
}
```

---

## 🔄 Migration

### **Old Code:**
```typescript
const handleSubmit = async () => {
  try {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const error = await res.json();
      showError(error.message);
      return;
    }

    const data = await res.json();
    showSuccess("Success!");
  } catch (error) {
    showError("Network error");
  }
};
```

### **New Code:**
```typescript
const api = useApi();

const handleSubmit = async () => {
  await api.post("/api/requests", formData, {
    showSuccessToast: true,
    successMessage: "Success!"
  });
};
```

**20 lines → 5 lines!** 🎉

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `API_UTILITY_GUIDE.md` | Complete guide with examples |
| `API_QUICK_REF.md` | Quick reference card |
| `src/hooks/useApi.ts` | Source code with comments |
| `src/components/relief/ApiDemo.tsx` | Demo component |

---

## 🎮 Test It!

### **1. Add Demo to Dashboard:**

```typescript
// In src/app/dashboard/page.tsx
import ApiDemo from "@/components/relief/ApiDemo";

export default function Dashboard() {
  return (
    <div>
      {/* Other components */}
      <ApiDemo />
    </div>
  );
}
```

### **2. Test API Calls:**
- Click buttons to test GET, POST, PUT
- See toast notifications automatically!
- Check response in the UI

---

## ✅ Checklist

- [x] `useApi` hook created
- [x] Toast integration
- [x] TypeScript support
- [x] Documentation complete
- [x] Demo component
- [x] Example hooks (useRequests.v2)
- [x] Quick reference card

---

## 🚀 Ready to Use!

Import và bắt đầu ngay:

```typescript
import { useApi } from "@/hooks/useApi";

const api = useApi();

// GET
await api.get("/api/requests");

// POST
await api.post("/api/requests", data);

// Done! 🎉
```

---

## 💡 Pro Tips

1. **Use with React Query** - Perfect combo!
2. **TypeScript types** - Add types for responses
3. **Success toast** - Only for important actions
4. **Error toast** - Auto-enabled, very helpful
5. **Consistency** - Use everywhere in your app

---

## 🎯 Next Steps

1. ✅ Read `API_QUICK_REF.md` for quick start
2. ✅ Check `API_UTILITY_GUIDE.md` for details
3. ✅ Update existing hooks to use `useApi`
4. ✅ Test with `ApiDemo` component
5. ✅ Enjoy coding with less boilerplate! 🚀

---

**API Utility is ready! Start using it now! 🎉**

```typescript
// It's this simple:
const api = useApi();
const data = await api.get("/api/endpoint");
```

