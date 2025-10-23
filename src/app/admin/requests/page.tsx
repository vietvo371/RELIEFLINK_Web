"use client";

import { useState } from "react";
import { FileText, LifeBuoy } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminModal from "@/components/admin/AdminModal";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminRequestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu cứu trợ"
        description="Theo dõi và xử lý tất cả yêu cầu cứu trợ"
        showAddButton
        addButtonText="+ Thêm yêu cầu"
        onAdd={() => setIsModalOpen(true)}
      />

      <AdminEmptyState
        icon={<FileText className="h-6 w-6" aria-hidden />}
        title="Trang quản lý yêu cầu"
        description="Chúng tôi đang xây dựng bảng yêu cầu trực tuyến. Mọi tính năng duyệt và xử lý sẽ sớm có mặt."
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm yêu cầu cứu trợ"
        description="Tính năng đang được hoàn thiện. Bạn sẽ sớm có thể thêm yêu cầu trực tiếp tại đây."
        size="md"
      >
        <AdminEmptyState
          icon={<LifeBuoy className="h-6 w-6" aria-hidden />}
          title="Tính năng đang xây dựng"
          description="Hãy quay lại sau khi hệ thống cập nhật để tạo mới yêu cầu cứu trợ."
          variant="subtle"
          compact
          className="border-none bg-transparent shadow-none"
        />
      </AdminModal>
    </div>
  );
}
