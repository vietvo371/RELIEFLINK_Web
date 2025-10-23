"use client";

import { useState } from "react";
import { Package, Wrench } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminModal from "@/components/admin/AdminModal";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminResourcesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý nguồn lực"
        description="Theo dõi kho và phân bổ nguồn lực cứu trợ"
        showAddButton
        addButtonText="+ Thêm nguồn lực"
        onAdd={() => setIsModalOpen(true)}
      />

      <AdminEmptyState
        icon={<Package className="h-6 w-6" aria-hidden />}
        title="Trang quản lý nguồn lực"
        description="Chức năng đang được phát triển. Vui lòng quay lại sau khi đội ngũ hoàn tất."
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm nguồn lực mới"
        description="Tính năng đang được hoàn thiện. Bạn sẽ sớm có thể quản lý nguồn lực tại đây."
        size="md"
      >
        <AdminEmptyState
          icon={<Wrench className="h-6 w-6" aria-hidden />}
          title="Tính năng đang xây dựng"
          description="Chúng tôi đang hoàn thiện quy trình thêm nguồn lực trực tiếp từ dashboard."
          variant="subtle"
          compact
          className="border-none bg-transparent shadow-none"
        />
      </AdminModal>
    </div>
  );
}
