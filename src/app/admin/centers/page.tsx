"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useCenters, useCreateCenter } from "@/hooks/useCenters";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminForm from "@/components/admin/AdminForm";
import Badge from "@/components/ui/badge/Badge";
import AdminModal from "@/components/admin/AdminModal";
import Button from "@/components/ui/button/Button";

export default function AdminCentersPage() {
  const { data, isLoading } = useCenters();
  const createCenter = useCreateCenter();

  const centers = (data as any)?.centers || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    { key: "ten_trung_tam", label: "Tên trung tâm" },
    { key: "dia_chi", label: "Địa chỉ" },
    { 
      key: "nguoi_quan_ly", 
      label: "Quản lý",
      render: (value: any) => value || "-"
    },
    { 
      key: "so_lien_he", 
      label: "Liên hệ",
      render: (value: any) => value || "-"
    },
    { 
      key: "nguon_lucs", 
      label: "Kho",
      render: (value: any) => (
        <Badge color="info" size="sm">
          {value?.length || 0} mục
        </Badge>
      )
    },
  ];

  const formFields = [
    { key: "ten_trung_tam", label: "Tên trung tâm", type: "text" as const, required: true },
    { key: "dia_chi", label: "Địa chỉ", type: "text" as const, required: true },
    { key: "vi_do", label: "Vĩ độ", type: "number" as const, placeholder: "10.8231" },
    { key: "kinh_do", label: "Kinh độ", type: "number" as const, placeholder: "106.6297" },
    { key: "nguoi_quan_ly", label: "Người quản lý", type: "text" as const },
    { key: "so_lien_he", label: "Số liên hệ", type: "text" as const },
  ];

  const filteredCenters = centers.filter((center: any) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const targets = [
      center.ten_trung_tam,
      center.dia_chi,
      center.nguoi_quan_ly,
      center.so_lien_he,
    ]
      .filter(Boolean)
      .map((value: string) => value.toLowerCase());
    return targets.some((value: string) => value.includes(query));
  });

  const handleSubmit = async (formData: any) => {
    try {
      await createCenter.mutateAsync(formData);
      setIsModalOpen(false);
    } catch {
      // handled by toast in hook
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý trung tâm"
        description="CRUD trung tâm cứu trợ"
        showAddButton
        onAdd={() => setIsModalOpen(true)}
        addButtonText="+ Thêm trung tâm"
      />

      <AdminDataTable
        columns={columns}
        data={filteredCenters}
        isLoading={isLoading}
        emptyMessage="Chưa có trung tâm nào"
        emptyDescription="Hãy tạo trung tâm đầu tiên để bắt đầu quản lý nguồn lực."
        emptyIcon={<Building2 className="h-6 w-6" aria-hidden />}
        emptyAction={
          <Button
            startIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Tạo trung tâm mới
          </Button>
        }
        searchable
        searchPlaceholder="Tìm kiếm theo tên, địa chỉ hoặc người quản lý..."
        onSearch={setSearchQuery}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm trung tâm mới"
        description="Nhập thông tin chi tiết để thêm trung tâm cứu trợ."
      >
        <AdminForm
          title="Thông tin trung tâm"
          fields={formFields}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createCenter.isPending}
          submitText="+ Thêm trung tâm"
          cancelText="Hủy"
          showDismissIcon={false}
          showCancelButton
          variant="borderless"
        />
      </AdminModal>
    </div>
  );
}
