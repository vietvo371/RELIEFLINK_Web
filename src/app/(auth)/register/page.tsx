
import { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Register | RELIEFLINK",
  description: "Register to your account",
};

export default function RegisterPage() {
  // const router = useRouter();
  // const { login } = useAuthStore();
  // const { success, error: showError } = useToast();
  // const [isLogin, setIsLogin] = useState(true);
  // const [loading, setLoading] = useState(false);

  // const [formData, setFormData] = useState({
  //   email: "",
  //   mat_khau: "",
  //   ho_va_ten: "",
  //   so_dien_thoai: "",
  //   vai_tro: "nguoi_dan",
  // });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const response = await fetch("/api/auth", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         action: isLogin ? "login" : "register",
  //         ...formData,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || "Xác thực thất bại");
  //     }

  //     login(data.user, data.token);
  //     success(isLogin ? "🎉 Đăng nhập thành công!" : "🎉 Đăng ký thành công!");

  //     // Redirect based on role
  //     const role = data.user.vai_tro;
  //     if (role === "admin") {
  //       router.push("/admin/dashboard");
  //     } else if (role === "tinh_nguyen_vien") {
  //       router.push("/volunteer/dashboard");
  //     } else {
  //       router.push("/citizen/dashboard");
  //     }
  //   } catch (err: any) {
  //     showError(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return <SignUpForm />;
}
