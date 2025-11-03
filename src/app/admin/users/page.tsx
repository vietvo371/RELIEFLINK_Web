"use client";

import { useMemo, useState } from "react";
import { Users, UserCheck, UserCog, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useUsers, AdminUser } from "@/hooks/useUsers";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  tinh_nguyen_vien: "Tình nguyện viên",
  nguoi_dan: "Người dân",
};

const roleColors: Record<string, string> = {
  admin: "error",
  tinh_nguyen_vien: "success",
  nguoi_dan: "info",
};

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data, isLoading } = useUsers(roleFilter !== "all" ? roleFilter : undefined);
  const users = useMemo(() => (data?.users || []) as AdminUser[], [data]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.ho_va_ten, user.email, user.so_dien_thoai]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => user.vai_tro === "admin").length;
    const volunteers = users.filter((user) => user.vai_tro === "tinh_nguyen_vien").length;
    const citizens = users.filter((user) => user.vai_tro === "nguoi_dan").length;
    return {
      total,
      admins,
      volunteers,
      citizens,
    };
  }, [users]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (value: number) => `#${value}`,
      },
      {
        key: "ho_va_ten",
        label: "Họ và tên",
      },
      {
        key: "email",
        label: "Email",
      },
      {
        key: "so_dien_thoai",
        label: "SĐT",
        render: (value?: string | null) => value || "-",
      },
      {
        key: "vai_tro",
        label: "Vai trò",
        render: (value: string) => (
          <Badge color={roleColors[value] || "light"} size="sm">
            {roleLabels[value] || value}
          </Badge>
        ),
      },
      {
        key: "created_at",
        label: "Ngày tạo",
        render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: AdminUser) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedUser(row)}>
            Xem chi tiết
          </Button>
        ),
      },
    ],
    [],
  );

  const roleOptions = [
    { value: "all", label: "Tất cả vai trò" },
    { value: "admin", label: roleLabels.admin },
    { value: "tinh_nguyen_vien", label: roleLabels.tinh_nguyen_vien },
    { value: "nguoi_dan", label: roleLabels.nguoi_dan },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Theo dõi tài khoản và vai trò trong hệ thống"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatsCard
          title="Tổng người dùng"
          value={stats.total}
          icon={Users}
          color="blue"
          description="Tất cả tài khoản đang hoạt động"
        />
        <AdminStatsCard
          title="Quản trị viên"
          value={stats.admins}
          icon={UserCog}
          color="purple"
          description="Quyền quản trị hệ thống"
        />
        <AdminStatsCard
          title="Tình nguyện viên"
          value={stats.volunteers}
          icon={UserCheck}
          color="green"
          description="Tham gia vận hành phân phối"
        />
        <AdminStatsCard
          title="Người dân"
          value={stats.citizens}
          icon={UserPlus}
          color="orange"
          description="Người dân sử dụng ứng dụng"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải danh sách người dùng..."
          className="min-h-[320px]"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Tìm theo tên, email hoặc số điện thoại..."
          onSearch={setSearchQuery}
          filters={[
            {
              key: "role",
              label: "Lọc theo vai trò",
              options: roleOptions,
              onChange: setRoleFilter,
            },
          ]}
          emptyMessage="Chưa có người dùng"
          emptyDescription="Hệ thống chưa có tài khoản nào."
          emptyIcon={<Users className="h-6 w-6" aria-hidden />}
        />
      )}

      <AdminModal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? selectedUser.ho_va_ten || selectedUser.email : "Chi tiết người dùng"}
        description={selectedUser?.email}
        size="md"
      >
        {selectedUser ? (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
            <div className="space-y-1">
              <p className="font-medium">Họ và tên</p>
              <p>{selectedUser.ho_va_ten || "Chưa cập nhật"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Email</p>
              <p>{selectedUser.email}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Số điện thoại</p>
              <p>{selectedUser.so_dien_thoai || "Chưa cập nhật"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Vai trò</p>
              <Badge color={roleColors[selectedUser.vai_tro] || "light"} size="sm">
                {roleLabels[selectedUser.vai_tro] || selectedUser.vai_tro}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Ngày tham gia</p>
              <p>{format(new Date(selectedUser.created_at), "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={<Users className="h-6 w-6" aria-hidden />}
            title="Chưa chọn người dùng"
            description="Chọn một người dùng trong bảng để xem chi tiết."
            variant="subtle"
            compact
          />
        )}
      </AdminModal>
    </div>
  );
}
