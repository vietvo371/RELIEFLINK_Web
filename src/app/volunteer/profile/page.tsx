"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import {
  User,
  Mail,
  Phone,
  Heart,
  Edit,
  Lock,
  Calendar,
  Save,
  X,
  Shield,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";

type ProfileForm = {
  ho_va_ten: string;
  so_dien_thoai: string;
};

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  tinh_nguyen_vien: "Tình nguyện viên",
  citizen: "Người dân",
  nguoi_dan: "Người dân",
};

const roleColors: Record<string, "primary" | "success" | "info" | "warning"> = {
  admin: "primary",
  tinh_nguyen_vien: "success",
  citizen: "info",
  nguoi_dan: "info",
};

export default function VolunteerProfilePage() {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
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
      } else {
        const errorMsg = data.error || "Không thể cập nhật thông tin.";
        setProfileError(errorMsg);
        showError(errorMsg);
      }
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Hồ sơ cá nhân
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => {
              setEditForm({
                ho_va_ten: user.ho_va_ten || "",
                so_dien_thoai: user.so_dien_thoai || "",
              });
              setProfileError(null);
              setIsEditModalOpen(true);
            }}
            variant="primary"
            size="sm"
            startIcon={<Edit className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Chỉnh sửa</span>
            <span className="sm:hidden">Sửa</span>
          </Button>
          <Button
            onClick={() => {
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setPasswordError(null);
              setIsPasswordModalOpen(true);
            }}
            variant="outline"
            size="sm"
            startIcon={<Lock className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Đổi mật khẩu</span>
            <span className="sm:hidden">Mật khẩu</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* Thông tin cá nhân */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 md:gap-6 mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg flex-shrink-0">
                {user.ho_va_ten?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                  {user.ho_va_ten || "Chưa cập nhật"}
                </h2>
                <Badge
                  color={(roleColors[user.vai_tro] || "info") as any}
                  size="sm"
                >
                  {roleLabels[user.vai_tro] || user.vai_tro}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Số điện thoại
                  </p>
                  <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                    {user.so_dien_thoai || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Vai trò
                  </p>
                  <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                    {roleLabels[user.vai_tro] || user.vai_tro}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Ngày tham gia
                  </p>
                  <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
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
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bảo mật
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Đảm bảo tài khoản của bạn được bảo vệ bằng mật khẩu mạnh.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setPasswordError(null);
                setIsPasswordModalOpen(true);
              }}
              className="w-full"
              startIcon={<Lock className="w-4 h-4" />}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Chỉnh sửa thông tin cá nhân
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setProfileError(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
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

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setProfileError(null);
                }}
                disabled={isLoadingProfile}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 sm:mr-2" />
                Hủy
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isLoadingProfile}
                className="w-full sm:w-auto"
                startIcon={<Save className="w-4 h-4" />}
              >
                {isLoadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Đổi mật khẩu
              </h2>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordError(null);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
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

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 sm:mr-2" />
                Hủy
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={isLoadingPassword}
                className="w-full sm:w-auto"
                startIcon={<Lock className="w-4 h-4" />}
              >
                {isLoadingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
