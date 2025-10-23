"use client";

import { useBlockchainLogs } from "@/hooks/useBlockchain";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";

export default function AdminBlockchainPage() {
  const { data, isLoading } = useBlockchainLogs();
  const logs = data?.logs || [];

  const columns = [
    { key: "id", label: "ID", render: (value: any) => `#${value}` },
    { 
      key: "ma_giao_dich", 
      label: "TX Hash",
      render: (value: any) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {value}
        </code>
      )
    },
    { key: "hanh_dong", label: "Hành động" },
    { 
      key: "phan_phoi", 
      label: "Phân phối",
      render: (value: any) => `PP #${value?.id || "N/A"}`
    },
    { 
      key: "thoi_gian", 
      label: "Thời gian",
      render: (value: any) => new Date(value).toLocaleString()
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blockchain Log"
        description="Lịch sử giao dịch blockchain"
      />

      <AdminDataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="Chưa có log blockchain"
        searchable
        searchPlaceholder="Tìm kiếm theo hash..."
      />
    </div>
  );
}
