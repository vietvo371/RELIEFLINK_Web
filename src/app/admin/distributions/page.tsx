"use client";

import { useState } from "react";
import { Box, Truck } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminModal from "@/components/admin/AdminModal";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminDistributionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý phân phối"
        description="Theo dõi tiến độ phân phối và vận chuyển"
        showAddButton
        addButtonText="+ Thêm phân phối"
        onAdd={() => setIsModalOpen(true)}
      />

      <AdminEmptyState
        icon={<Truck className="h-6 w-6" aria-hidden />}
        title="Trang quản lý phân phối"
        description="Chức năng đang được phát triển. Chúng tôi sẽ cập nhật khi hệ thống vận hành đầy đủ."
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm phân phối mới"
        description="Chức năng thêm phân phối đang được hoàn thiện."
        size="md"
      >
        <AdminEmptyState
          icon={<Box className="h-6 w-6" aria-hidden />}
          title="Tính năng đang xây dựng"
          description="Bạn sẽ quản lý lịch sử và kế hoạch phân phối trực tiếp từ đây sau khi cập nhật."
          variant="subtle"
          compact
          className="border-none bg-transparent shadow-none"
        />
      </AdminModal>
    </div>
  );
}
