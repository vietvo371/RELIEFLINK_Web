"use client";

import { MapPin, Users, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface ReliefCardProps {
  request: {
    id: number;
    loai_yeu_cau: string;
    mo_ta?: string | null;
    so_nguoi: number;
    do_uu_tien: string;
    trang_thai: string;
    created_at: string;
    nguoi_dung?: {
      ho_va_ten: string;
    };
  };
  onClick?: () => void;
}

export default function ReliefCard({ request, onClick }: ReliefCardProps) {
  const getPriorityColor = (priority: string) => {
    if (priority === "cao") return "text-red-600 bg-red-100 dark:bg-red-900/20";
    if (priority === "trung_binh")
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-green-600 bg-green-100 dark:bg-green-900/20";
  };

  const getStatusColor = (status: string) => {
    if (status === "hoan_thanh")
      return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (status === "dang_xu_ly")
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  };

  const getPriorityText = (priority: string) => {
    if (priority === "cao") return "Cao";
    if (priority === "trung_binh") return "Trung bình";
    return "Thấp";
  };

  const getStatusText = (status: string) => {
    if (status === "hoan_thanh") return "Hoàn thành";
    if (status === "dang_xu_ly") return "Đang xử lý";
    return "Chờ xử lý";
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-orange-500"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {request.loai_yeu_cau}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {request.nguoi_dung?.ho_va_ten || "N/A"}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.do_uu_tien)}`}>
          <AlertCircle className="w-3 h-3 inline mr-1" />
          {getPriorityText(request.do_uu_tien)}
        </span>
      </div>

      {/* Description */}
      {request.mo_ta && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {request.mo_ta}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {request.so_nguoi} người
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {format(new Date(request.created_at), "dd/MM/yyyy")}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.trang_thai)}`}>
          {getStatusText(request.trang_thai)}
        </span>
      </div>
    </div>
  );
}

