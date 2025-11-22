/**
 * AdminApprovalDashboard Component
 * Dashboard để Admin phê duyệt yêu cầu cứu trợ
 */

import React, { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Target
} from "lucide-react";
import { 
  usePendingApprovalRequests, 
  useApproveRequest,
  useBatchUpdatePriorities 
} from "@/hooks/useWorkflow";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ApprovalModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approved: boolean, reason?: string) => void;
  isLoading: boolean;
}

function ApprovalModal({ request, isOpen, onClose, onApprove, isLoading }: ApprovalModalProps) {
  const [reason, setReason] = useState("");
  
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Phê duyệt yêu cầu cứu trợ</h3>
        
        {/* Request Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Người yêu cầu:</p>
              <p className="font-medium">{request.nguoi_dung?.ho_va_ten}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loại yêu cầu:</p>
              <p className="font-medium">{request.loai_yeu_cau}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số người:</p>
              <p className="font-medium">{request.so_nguoi} người</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Độ ưu tiên:</p>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                request.do_uu_tien === "cao" 
                  ? "bg-red-100 text-red-800" 
                  : request.do_uu_tien === "trung_binh"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {request.do_uu_tien.toUpperCase()}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Mô tả:</p>
              <p className="font-medium">{request.mo_ta || "Không có mô tả"}</p>
            </div>
          </div>

          {/* Priority Score */}
          {request.diem_uu_tien > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Điểm ưu tiên: {request.diem_uu_tien}/100
                </span>
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${request.diem_uu_tien}%` }}
                />
              </div>
            </div>
          )}

          {/* Auto-match info */}
          {request.nguon_luc_match && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Đã tự động match với nguồn lực
                </span>
              </div>
              <p className="text-sm text-green-700">
                {request.nguon_luc_match.ten_nguon_luc} tại {request.nguon_luc_match.trung_tam?.ten_trung_tam}
              </p>
              {request.khoang_cach_gan_nhat && (
                <p className="text-xs text-green-600 mt-1">
                  Khoảng cách: {Number(request.khoang_cach_gan_nhat).toFixed(1)} km
                </p>
              )}
            </div>
          )}
        </div>

        {/* Rejection Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lý do từ chối (nếu từ chối):
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Nhập lý do từ chối yêu cầu..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={() => onApprove(false, reason)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4" />
            <span>Từ chối</span>
          </button>
          <button
            onClick={() => onApprove(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Phê duyệt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminApprovalDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: pendingRequests, isLoading, refetch } = usePendingApprovalRequests();
  const approveRequest = useApproveRequest();
  const batchUpdatePriorities = useBatchUpdatePriorities();

  const handleApprove = async (approved: boolean, reason?: string) => {
    if (!selectedRequest) return;

    try {
      await approveRequest.mutateAsync({
        requestId: selectedRequest.id,
        data: { approved, reason }
      });
      setIsModalOpen(false);
      setSelectedRequest(null);
      refetch();
    } catch (error) {
      console.error("Approval error:", error);
    }
  };

  const handleBatchUpdatePriorities = () => {
    batchUpdatePriorities.mutate();
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-100";
    if (score >= 60) return "text-orange-600 bg-orange-100";
    if (score >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phê duyệt yêu cầu cứu trợ</h2>
          <p className="text-gray-600">
            {pendingRequests?.length || 0} yêu cầu đang chờ phê duyệt
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBatchUpdatePriorities}
            disabled={batchUpdatePriorities.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Cập nhật Priority</span>
          </button>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      {!pendingRequests || pendingRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có yêu cầu nào cần phê duyệt
          </h3>
          <p className="text-gray-600">Tất cả yêu cầu đã được xử lý</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map((request: any) => (
            <div key={request.id} className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.loai_yeu_cau}
                    </h3>
                    
                    {/* Priority Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.do_uu_tien === "cao" 
                        ? "bg-red-100 text-red-800" 
                        : request.do_uu_tien === "trung_binh"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {request.do_uu_tien.toUpperCase()}
                    </span>

                    {/* Priority Score */}
                    {request.diem_uu_tien > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.diem_uu_tien)}`}>
                        {request.diem_uu_tien}/100
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{request.nguoi_dung?.ho_va_ten}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{request.so_nguoi} người</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {formatDistanceToNow(new Date(request.created_at), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>

                  {request.mo_ta && (
                    <p className="text-sm text-gray-600 mb-4">{request.mo_ta}</p>
                  )}

                  {/* Auto-match status */}
                  {request.trang_thai_matching === "da_match" && request.nguon_luc_match && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          Đã match với: {request.nguon_luc_match.ten_nguon_luc}
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Trung tâm: {request.nguon_luc_match.trung_tam?.ten_trung_tam}
                        {request.khoang_cach_gan_nhat && (
                          <span className="ml-2">
                            ({Number(request.khoang_cach_gan_nhat).toFixed(1)} km)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApprove}
        isLoading={approveRequest.isPending}
      />
    </div>
  );
}