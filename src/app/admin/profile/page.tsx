"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit,
  Lock,
  Calendar,
  Save,
  X,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminModal from "@/components/admin/AdminModal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import AdminLoading from "@/components/admin/AdminLoading";

type ProfileForm = {
  ho_va_ten: string;
  so_dien_thoai: string;
};

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  tinh_nguyen_vien: "Tình nguyện viên",
  nguoi_dan: "Người dân",
};

const roleColors: Record<string, "primary" | "success" | "info" | "warning"> = {
  admin: "primary",
  tinh_nguyen_vien: "success",
  nguoi_dan: "info",
};

export default function AdminProfilePage() {
  const { user, setUser } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProfileForm>({
    ho_va_ten: user?.ho_va_ten || "",
    so_dien_thoai: user?.so_dien_thoai || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) {
    return (
      <AdminLoading variant="page" label="Đang tải thông tin hồ sơ..." />
    );
  }

  const handleInputChange = (key: keyof ProfileForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
    setProfileError(null);
  };

  const handlePasswordChange = (key: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    setPasswordError(null);
  };

  const validateProfile = (): boolean => {
    if (!editForm.ho_va_ten.trim()) {
      const errorMsg = "Vui lòng nhập họ và tên.";
      setProfileError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (editForm.ho_va_ten.trim().length < 2) {
      const errorMsg = "Họ và tên phải có ít nhất 2 ký tự.";
      setProfileError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (editForm.so_dien_thoai && editForm.so_dien_thoai.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(editForm.so_dien_thoai.trim())) {
        const errorMsg = "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.";
        setProfileError(errorMsg);
        showError(errorMsg);
        return false;
      }
    }

    return true;
  };

  const validatePassword = (): boolean => {
    if (!passwordForm.currentPassword.trim()) {
      const errorMsg = "Vui lòng nhập mật khẩu hiện tại.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (!passwordForm.newPassword.trim()) {
      const errorMsg = "Vui lòng nhập mật khẩu mới.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword.length < 6) {
      const errorMsg = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword.length > 50) {
      const errorMsg = "Mật khẩu mới không được vượt quá 50 ký tự.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      const errorMsg = "Mật khẩu mới phải khác mật khẩu hiện tại.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const errorMsg = "Mật khẩu mới và xác nhận mật khẩu không khớp.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {

    if (!validateProfile()) {
      return;
    }

    setProfileError(null);
    setIsLoadingProfile(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ho_va_ten: editForm.ho_va_ten.trim(),
          so_dien_thoai: editForm.so_dien_thoai.trim() || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess("Cập nhật thông tin thành công!");
      } else {
        const errorMsg = data.error || "Không thể cập nhật thông tin.";
        setProfileError(errorMsg);
        showError(errorMsg);
        return;
      }
      setUser({
        ...user,
        ho_va_ten: editForm.ho_va_ten.trim(),
        so_dien_thoai: editForm.so_dien_thoai.trim() || null,
      });

      setIsEditModalOpen(false);
      setEditForm({
        ho_va_ten: editForm.ho_va_ten.trim(),
        so_dien_thoai: editForm.so_dien_thoai.trim() || "",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật thông tin.";
      setProfileError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setPasswordError(null);
    setIsLoadingPassword(true);

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Không thể đổi mật khẩu.";
        setPasswordError(errorMsg);
        showError(errorMsg);
        return;
      }

      showSuccess("Đổi mật khẩu thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordModalOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi đổi mật khẩu.";
      setPasswordError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin tài khoản của bạn"
        actions={[
          {
            label: "Chỉnh sửa thông tin",
            variant: "primary",
            onClick: () => {
              setEditForm({
                ho_va_ten: user.ho_va_ten || "",
                so_dien_thoai: user.so_dien_thoai || "",
              });
              setProfileError(null);
              setIsEditModalOpen(true);
            },
            icon: <Edit className="w-4 h-4" />,
          },
          {
            label: "Đổi mật khẩu",
            variant: "outline",
            onClick: () => {
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setPasswordError(null);
              setIsPasswordModalOpen(true);
            },
            icon: <Lock className="w-4 h-4" />,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Thông tin cá nhân */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.ho_va_ten?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.ho_va_ten || "Chưa cập nhật"}
                </h2>
                <div className="mt-2">
                  <Badge
                    color={roleColors[user.vai_tro] || "light"}
                    size="sm"
                  >
                    {roleLabels[user.vai_tro] || user.vai_tro}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Số điện thoại
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.so_dien_thoai || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Vai trò
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {roleLabels[user.vai_tro] || user.vai_tro}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Ngày tham gia
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {(user as any).created_at
                      ? format(new Date((user as any).created_at), "dd/MM/yyyy HH:mm")
                      : "Chưa có thông tin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin tài khoản
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID người dùng</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  #{user.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Trạng thái</span>
                <Badge color="success" size="sm">
                  Đang hoạt động
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bảo mật
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Đảm bảo tài khoản của bạn được bảo vệ bằng mật khẩu mạnh.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full"
              startIcon={<Lock className="w-4 h-4" />}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProfileError(null);
        }}
        title="Chỉnh sửa thông tin cá nhân"
        description="Cập nhật thông tin của bạn"
        size="md"
      >
        <div className="space-y-4">
          {profileError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
              {profileError}
            </div>
          )}

          <div>
            <Label htmlFor="ho_va_ten">Họ và tên *</Label>
            <Input
              id="ho_va_ten"
              type="text"
              value={editForm.ho_va_ten}
              onChange={(e) => handleInputChange("ho_va_ten", e.target.value)}
              placeholder="Nhập họ và tên"
              disabled={isLoadingProfile}
            />
          </div>

          <div>
            <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
            <Input
              id="so_dien_thoai"
              type="tel"
              value={editForm.so_dien_thoai}
              onChange={(e) => handleInputChange("so_dien_thoai", e.target.value)}
              placeholder="Nhập số điện thoại (10-11 chữ số)"
              disabled={isLoadingProfile}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Để trống nếu không muốn cập nhật số điện thoại
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Lưu ý:</strong> Email và vai trò không thể thay đổi. Vui lòng
              liên hệ quản trị viên nếu cần thay đổi.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4 border-t border-gray-200 dark:border-white/[0.08]">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setProfileError(null);
            }}
            disabled={isLoadingProfile}
            startIcon={<X className="w-4 h-4" />}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={isLoadingProfile}
            startIcon={<Save className="w-4 h-4" />}
          >
            {isLoadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </AdminModal>

      {/* Modal đổi mật khẩu */}
      <AdminModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordError(null);
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }}
        title="Đổi mật khẩu"
        description="Nhập mật khẩu hiện tại và mật khẩu mới"
        size="md"
      >
        <div className="space-y-4">
          {passwordError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
              {passwordError}
            </div>
          )}

          <div>
            <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              placeholder="Nhập mật khẩu hiện tại"
              disabled={isLoadingPassword}
            />
          </div>

          <div>
            <Label htmlFor="newPassword">Mật khẩu mới *</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              disabled={isLoadingPassword}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mật khẩu phải có từ 6-50 ký tự và khác mật khẩu hiện tại
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              placeholder="Nhập lại mật khẩu mới"
              disabled={isLoadingPassword}
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Lưu ý:</strong> Mật khẩu phải có ít nhất 6 ký tự. Sau khi
              đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4 border-t border-gray-200 dark:border-white/[0.08]">
          <Button
            variant="outline"
            onClick={() => {
              setIsPasswordModalOpen(false);
              setPasswordError(null);
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }}
            disabled={isLoadingPassword}
            startIcon={<X className="w-4 h-4" />}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            disabled={isLoadingPassword}
            startIcon={<Lock className="w-4 h-4" />}
          >
            {isLoadingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>
        </div>
      </AdminModal>
    </div>
  );
}

