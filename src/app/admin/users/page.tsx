"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import Badge from "@/components/ui/badge/Badge";

export default function AdminUsersPage() {
  const [role, setRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useUsers(role || undefined);
  const users = data?.users || [];

  const filteredUsers = users.filter((u: any) => 
    u.ho_va_ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: "id", label: "ID", render: (value: any) => `#${value}` },
    { key: "ho_va_ten", label: "Họ và tên" },
    { key: "email", label: "Email" },
    { 
      key: "so_dien_thoai", 
      label: "SĐT",
      render: (value: any) => value || "-"
    },
    { 
      key: "vai_tro", 
      label: "Vai trò",
      render: (value: any) => {
        const roleColors: Record<string, string> = {
          admin: "error",
          tinh_nguyen_vien: "success", 
          nguoi_dan: "info"
        };
        return (
          <Badge color={roleColors[value] || "light"} size="sm">
            {value}
          </Badge>
        );
      }
    },
    { 
      key: "created_at", 
      label: "Ngày tạo",
      render: (value: any) => new Date(value).toLocaleDateString()
    },
  ];

  const roleOptions = [
    { value: "", label: "Tất cả vai trò" },
    { value: "admin", label: "Admin" },
    { value: "tinh_nguyen_vien", label: "Tình nguyện viên" },
    { value: "nguoi_dan", label: "Người dân" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Danh sách user và phân quyền"
      />

      <AdminDataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        emptyMessage="Chưa có người dùng"
        searchable
        searchPlaceholder="Tìm kiếm người dùng..."
        onSearch={setSearchQuery}
        filters={[
          {
            key: "role",
            label: "Vai trò",
            options: roleOptions,
            onChange: setRole
          }
        ]}
      />
    </div>
  );
}
