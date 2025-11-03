"use client";

import { Brain } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminAIPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dự báo AI"
        description="Phân tích và dự đoán nhu cầu cứu trợ"
      />

      <AdminEmptyState
        icon={<Brain className="h-6 w-6" aria-hidden />}
        title="Trang dự báo AI"
        description="Các mô hình AI đang được huấn luyện. Tính năng phân tích dự báo sẽ sớm xuất hiện tại đây."
      />
    </div>
  );
}
