"use client";

import { useState } from "react";
import { useRequests, useCreateRequest } from "@/hooks/useRequests";
import { Plus, Filter, Loader2 } from "lucide-react";
import ReliefCard from "@/components/relief/ReliefCard";

export default function RequestsPage() {
  const [filter, setFilter] = useState<{ trang_thai?: string; do_uu_tien?: string }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading } = useRequests(filter);
  const createMutation = useCreateRequest();

  const [formData, setFormData] = useState({
    loai_yeu_cau: "",
    mo_ta: "",
    so_nguoi: "",
    do_uu_tien: "trung_binh",
    vi_do: "",
    kinh_do: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowCreateModal(false);
      setFormData({
        loai_yeu_cau: "",
        mo_ta: "",
        so_nguoi: "",
        do_uu_tien: "trung_binh",
        vi_do: "",
        kinh_do: "",
      });
    } catch (error) {
      console.error("Create request error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const requests = data?.requests || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Yêu cầu cứu trợ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý các yêu cầu cứu trợ từ người dân
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Tạo yêu cầu mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <select
            value={filter.trang_thai || ""}
            onChange={(e) => setFilter({ ...filter, trang_thai: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="cho_xu_ly">Chờ xử lý</option>
            <option value="dang_xu_ly">Đang xử lý</option>
            <option value="hoan_thanh">Hoàn thành</option>
          </select>
          <select
            value={filter.do_uu_tien || ""}
            onChange={(e) => setFilter({ ...filter, do_uu_tien: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả độ ưu tiên</option>
            <option value="cao">Cao</option>
            <option value="trung_binh">Trung bình</option>
            <option value="thap">Thấp</option>
          </select>
        </div>
      </div>

      {/* Requests grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request: any) => (
          <ReliefCard key={request.id} request={request} />
        ))}
      </div>

      {requests.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Không tìm thấy yêu cầu nào
          </p>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tạo yêu cầu cứu trợ mới
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại yêu cầu
                </label>
                <input
                  type="text"
                  required
                  value={formData.loai_yeu_cau}
                  onChange={(e) => setFormData({ ...formData, loai_yeu_cau: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Thực phẩm, nước uống, thuốc men..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.mo_ta}
                  onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Mô tả chi tiết yêu cầu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số người cần hỗ trợ
                </label>
                <input
                  type="number"
                  required
                  value={formData.so_nguoi}
                  onChange={(e) => setFormData({ ...formData, so_nguoi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  value={formData.do_uu_tien}
                  onChange={(e) => setFormData({ ...formData, do_uu_tien: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="cao">Cao</option>
                  <option value="trung_binh">Trung bình</option>
                  <option value="thap">Thấp</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Đang tạo..." : "Tạo yêu cầu"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

