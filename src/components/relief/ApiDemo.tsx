"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

/**
 * API Utility Demo Component
 * Demonstrates how simple the new API utility is!
 */
export default function ApiDemo() {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // GET Example
  const handleGet = async () => {
    setLoading(true);
    const result = await api.get("/api/requests");
    setData(result);
    setLoading(false);
  };

  // POST Example với success toast
  const handlePost = async () => {
    setLoading(true);
    await api.post(
      "/api/requests",
      {
        loai_yeu_cau: "Demo Request",
        mo_ta: "This is a demo",
        so_nguoi: 10,
        do_uu_tien: "trung_binh",
      },
      {
        showSuccessToast: true,
        successMessage: "✅ Demo: Tạo yêu cầu thành công!",
      }
    );
    setLoading(false);
  };

  // PUT Example
  const handlePut = async () => {
    setLoading(true);
    await api.put(
      "/api/requests/1",
      {
        trang_thai: "dang_xu_ly",
      },
      {
        showSuccessToast: true,
        successMessage: "✅ Demo: Cập nhật thành công!",
      }
    );
    setLoading(false);
  };

  // Error Example
  const handleError = async () => {
    setLoading(true);
    // This will auto-show error toast
    await api.get("/api/nonexistent-endpoint");
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        🚀 API Utility Demo
      </h2>

      <div className="space-y-4">
        {/* Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleGet}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            GET
          </button>

          <button
            onClick={handlePost}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            POST
          </button>

          <button
            onClick={handlePut}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            PUT
          </button>

          <button
            onClick={handleError}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            ERROR
          </button>
        </div>

        {/* Result */}
        {data && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Response:
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {/* Code Example */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold text-green-400 mb-2">
            📝 Code Example:
          </h3>
          <pre className="text-xs text-gray-300 overflow-x-auto">
{`import { useApi } from "@/hooks/useApi";

const api = useApi();

// GET - Siêu đơn giản!
const data = await api.get("/api/requests");

// POST với success toast
await api.post("/api/requests", 
  { data }, 
  {
    showSuccessToast: true,
    successMessage: "✅ Thành công!"
  }
);

// Lỗi tự động show toast!`}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Error toast tự động hiển thị khi API fail!
            Không cần try-catch nữa. 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

