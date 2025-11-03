"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  LifeBuoy,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminLoading from "@/components/admin/AdminLoading";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import {
  getPriorityColor,
  getRequestStatusColor,
  translateDistributionStatus,
  translatePriority,
  translateRequestStatus,
} from "@/lib/translations";
import { useRequests, useCreateRequest, useUpdateRequest } from "@/hooks/useRequests";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/context/ToastContext";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";

type ReliefUser = {
  ho_va_ten?: string | null;
  email?: string | null;
  so_dien_thoai?: string | null;
};

type AdminUser = {
  id: number;
  ho_va_ten?: string | null;
  email?: string | null;
  so_dien_thoai?: string | null;
};

type ReliefDistribution = {
  id: number;
  trang_thai: string;
  nguon_luc?: { ten_nguon_luc?: string | null } | null;
  tinh_nguyen_vien?: { ho_va_ten?: string | null } | null;
};

type ReliefRequest = {
  id: number;
  loai_yeu_cau: string;
  mo_ta?: string | null;
  so_nguoi: number;
  do_uu_tien: string;
  trang_thai: string;
  vi_do?: number | string | null;
  kinh_do?: number | string | null;
  created_at: string;
  nguoi_dung?: ReliefUser | null;
  phan_phois?: ReliefDistribution[];
};

type CreateRequestForm = {
  loai_yeu_cau: string;
  mo_ta: string;
  so_nguoi: string;
  do_uu_tien: string;
  trang_thai: string;
  vi_do: string;
  kinh_do: string;
};

const initialCreateForm: CreateRequestForm = {
  loai_yeu_cau: "",
  mo_ta: "",
  so_nguoi: "",
  do_uu_tien: "trung_binh",
  trang_thai: "cho_xu_ly",
  vi_do: "",
  kinh_do: "",
};

const prioritySelectOptions = [

  { value: "cao", label: translatePriority("cao") },
  { value: "trung_binh", label: translatePriority("trung_binh") },
  { value: "thap", label: translatePriority("thap") },
];

const statusSelectOptions = [
  { value: "cho_xu_ly", label: translateRequestStatus("cho_xu_ly") },
  { value: "dang_xu_ly", label: translateRequestStatus("dang_xu_ly") },
  { value: "hoan_thanh", label: translateRequestStatus("hoan_thanh") },
  { value: "huy_bo", label: translateRequestStatus("huy_bo") },
];

export default function AdminRequestsPage() {
  const { error: showError, success: showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRequestForm>(initialCreateForm);
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(null);
  const [updatePriority, setUpdatePriority] = useState("trung_binh");
  const [updateStatus, setUpdateStatus] = useState("cho_xu_ly");
  const [createLocation, setCreateLocation] = useState<Coordinates | null>(null);
  const [updateLocation, setUpdateLocation] = useState<Coordinates | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const normalizeCoord = (
    value: number | string | null | undefined,
  ): number | null => {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Number(numeric.toFixed(6));
  };

  const requestFilters = useMemo(() => {
    const filters: { trang_thai?: string; do_uu_tien?: string } = {};
    if (priorityFilter !== "all" && priorityFilter) {
      filters.do_uu_tien = priorityFilter;
    }
    if (statusFilter !== "all" && statusFilter) {
      filters.trang_thai = statusFilter;
    }
    return Object.keys(filters).length ? filters : undefined;
  }, [priorityFilter, statusFilter]);

  const {
    data,
    isLoading,
    refetch,
  } = useRequests(requestFilters);

  const { data: usersData, isLoading: usersLoading } = useUsers();
  const users = useMemo<AdminUser[]>(
    () => (usersData?.users as AdminUser[]) || [],
    [usersData],
  );
  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: String(user.id),
        label: user.ho_va_ten || user.email || `Người dùng #${user.id}`,
      })),
    [users],
  );

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === selectedUserId) || null,
    [users, selectedUserId],
  );

  useEffect(() => {
    if (isCreateModalOpen && !selectedUserId && userOptions.length > 0) {
      setSelectedUserId(userOptions[0].value);
    }
  }, [isCreateModalOpen, selectedUserId, userOptions]);

  const requests = useMemo(
    () => ((data?.requests || []) as ReliefRequest[]),
    [data],
  );

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const fields = [
        request.loai_yeu_cau,
        request.mo_ta,
        request.nguoi_dung?.ho_va_ten,
        request.nguoi_dung?.email,
        request.nguoi_dung?.so_dien_thoai,
        translatePriority(request.do_uu_tien),
        translateRequestStatus(request.trang_thai),
      ];

      return fields.some((field) =>
        field?.toString().toLowerCase().includes(normalizedQuery),
      );
    });
  }, [requests, searchQuery]);

  const stats = useMemo(() => {
    const total = requests.length;
    const urgent = requests.filter((req) => req.do_uu_tien === "cao").length;
    const inProgress = requests.filter((req) => req.trang_thai === "dang_xu_ly").length;
    const completed = requests.filter((req) => req.trang_thai === "hoan_thanh").length;

    return {
      total,
      urgent,
      inProgress,
      completed,
    };
  }, [requests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, statusFilter]);

  useEffect(() => {
    if (selectedRequest) {
      setUpdatePriority(selectedRequest.do_uu_tien || "trung_binh");
      setUpdateStatus(selectedRequest.trang_thai || "cho_xu_ly");
    } else {
      setUpdatePriority("trung_binh");
      setUpdateStatus("cho_xu_ly");
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (
      selectedRequest &&
      selectedRequest.vi_do !== null &&
      selectedRequest.vi_do !== undefined &&
      selectedRequest.kinh_do !== null &&
      selectedRequest.kinh_do !== undefined
    ) {
      const lat = Number(selectedRequest.vi_do);
      const lng = Number(selectedRequest.kinh_do);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setUpdateLocation({ lat, lng });
        return;
      }
    }
    setUpdateLocation(null);
  }, [selectedRequest]);

  useEffect(() => {
    if (!selectedRequest) return;
    const latest = requests.find((req) => req.id === selectedRequest.id);
    if (latest && latest !== selectedRequest) {
      setSelectedRequest(latest);
    }
  }, [requests, selectedRequest]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRequests.length / pageSize)),
    [filteredRequests.length, pageSize],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const createRequestMutation = useCreateRequest();
  const updateRequestMutation = useUpdateRequest(selectedRequest?.id ?? 0);

  const handleOpenCreateModal = () => {
    setCreateForm(initialCreateForm);
    setCreateLocation(null);
    setCreateError(null);
    setSelectedUserId("");
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateForm(initialCreateForm);
    setCreateLocation(null);
    setCreateError(null);
    setSelectedUserId("");
  };

  const handleCreateFormChange = (key: keyof CreateRequestForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateLocationChange = (coords: Coordinates | null) => {
    setCreateLocation(coords);
    setCreateForm((prev) => ({
      ...prev,
      vi_do: coords ? coords.lat.toString() : "",
      kinh_do: coords ? coords.lng.toString() : "",
    }));
  };

  const handleCreateRequest = () => {
    const trimmedType = createForm.loai_yeu_cau.trim();
    if (!trimmedType) {
      showError("Vui lòng nhập loại yêu cầu.");
      setCreateError("Vui lòng nhập loại yêu cầu.");
      return;
    }
    if (trimmedType.length < 3) {
      showError("Loại yêu cầu cần tối thiểu 3 ký tự.");
      setCreateError("Loại yêu cầu cần tối thiểu 3 ký tự.");
      return;
    }

    const peopleCount = Number(createForm.so_nguoi);
    if (!Number.isFinite(peopleCount) || peopleCount <= 0) {
      showError("Số người ảnh hưởng phải lớn hơn 0.");
      setCreateError("Số người ảnh hưởng phải lớn hơn 0.");
      return;
    }

    if (!createLocation) {
      showError("Vui lòng chọn vị trí trên bản đồ.");
      setCreateError("Vui lòng chọn vị trí trên bản đồ.");
      return;
    }
    if (!selectedUserId) {
      showError("Vui lòng chọn người gửi yêu cầu.");
      setCreateError("Vui lòng chọn người gửi yêu cầu.");
      return;
    }
    setCreateError(null);

    createRequestMutation.mutate(
      {
        loai_yeu_cau: trimmedType,
        mo_ta: createForm.mo_ta.trim() || null,
        so_nguoi: peopleCount,
        do_uu_tien: createForm.do_uu_tien,
        trang_thai: createForm.trang_thai,
        vi_do: createLocation.lat,
        kinh_do: createLocation.lng,
        id_nguoi_dung: Number(selectedUserId),
      },
      {
        onSuccess: () => {
          // Hiển thị toast trước để đảm bảo nó được render
          showSuccess("Tạo yêu cầu cứu trợ thành công!");
          // Sau đó mới đóng modal và reset form
          setTimeout(() => {
            setCreateForm(initialCreateForm);
            setCreateLocation(null);
            setCreateError(null);
            setSelectedUserId("");
            setIsCreateModalOpen(false);
          }, 100);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể tạo yêu cầu.";
          setCreateError(message);
          showError(message);
        },
      },
    );
  };

  const handleOpenDetail = (request: ReliefRequest) => {
    setSelectedRequest(request);
    setUpdateError(null);
    if (
      request.vi_do !== null &&
      request.vi_do !== undefined &&
      request.kinh_do !== null &&
      request.kinh_do !== undefined
    ) {
      const lat = Number(request.vi_do);
      const lng = Number(request.kinh_do);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setUpdateLocation({ lat, lng });
      } else {
        setUpdateLocation(null);
      }
    } else {
      setUpdateLocation(null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedRequest(null);
    setUpdateLocation(null);
    setUpdateError(null);
  };

  const handleUpdateLocationChange = (coords: Coordinates | null) => {
    setUpdateLocation(coords);
  };

  const handleUpdateRequest = () => {
    if (!selectedRequest) return;

    const originalLat = normalizeCoord(selectedRequest.vi_do);
    const originalLng = normalizeCoord(selectedRequest.kinh_do);
    const updatedLat = normalizeCoord(updateLocation?.lat ?? null);
    const updatedLng = normalizeCoord(updateLocation?.lng ?? null);

    const locationChanged =
      originalLat !== updatedLat || originalLng !== updatedLng;

    const hasChanges =
      updatePriority !== selectedRequest.do_uu_tien ||
      updateStatus !== selectedRequest.trang_thai ||
      locationChanged;

    if (!hasChanges) {
      handleCloseDetail();
      return;
    }

    updateRequestMutation.mutate(
      {
        do_uu_tien: updatePriority,
        trang_thai: updateStatus,
        vi_do: updateLocation ? updateLocation.lat : null,
        kinh_do: updateLocation ? updateLocation.lng : null,
      },
      {
        onSuccess: (data) => {
          if (data?.request) {
            setSelectedRequest(data.request);
          }
          setUpdateError(null);
          showSuccess("✅ Đã cập nhật yêu cầu.");
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể cập nhật yêu cầu.";
          setUpdateError(message);
          showError(message);
        },
      },
    );
  };

  const originalLatForComparison = normalizeCoord(selectedRequest?.vi_do);
  const originalLngForComparison = normalizeCoord(selectedRequest?.kinh_do);
  const updatedLatForComparison = normalizeCoord(updateLocation?.lat ?? null);
  const updatedLngForComparison = normalizeCoord(updateLocation?.lng ?? null);
  const locationChangedForComparison =
    selectedRequest !== null &&
    (originalLatForComparison !== updatedLatForComparison ||
      originalLngForComparison !== updatedLngForComparison);

  const hasUpdateChanges =
    !!selectedRequest &&
    (updatePriority !== selectedRequest.do_uu_tien ||
      updateStatus !== selectedRequest.trang_thai ||
      locationChangedForComparison);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredRequests, pageSize]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Mã yêu cầu",
        render: (value: number) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            #{value}
          </span>
        ),
      },
      {
        key: "loai_yeu_cau",
        label: "Loại yêu cầu",
        render: (_: string, row: ReliefRequest) => (
          <div className="max-w-xs space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.loai_yeu_cau}
            </p>
            {row.mo_ta && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {row.mo_ta}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "nguoi_dung",
        label: "Người gửi",
        render: (_: ReliefUser, row: ReliefRequest) => (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.nguoi_dung?.ho_va_ten || "Không xác định"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.nguoi_dung?.email || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "do_uu_tien",
        label: "Ưu tiên",
        render: (value: string) => (
          <Badge color={getPriorityColor(value)} size="sm">
            {translatePriority(value)}
          </Badge>
        ),
      },
      {
        key: "trang_thai",
        label: "Trạng thái",
        render: (value: string) => (
          <Badge color={getRequestStatusColor(value)} size="sm">
            {translateRequestStatus(value)}
          </Badge>
        ),
      },
      {
        key: "so_nguoi",
        label: "Số người",
        render: (value: number) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {value?.toLocaleString?.() ?? value}
          </span>
        ),
      },
      {
        key: "phan_phois",
        label: "Phân phối",
        render: (value: ReliefDistribution[] = []) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {value.length}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "Ngày tạo",
        render: (value: string) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {format(new Date(value), "dd/MM/yyyy HH:mm")}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: ReliefRequest) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenDetail(row)}
            startIcon={<Eye className="w-4 h-4" />}
          >
            Chi tiết
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu cứu trợ"
        description="Theo dõi, cập nhật và xử lý các yêu cầu cứu trợ trong hệ thống"
        showAddButton
        addButtonText="Thêm yêu cầu"
        onAdd={handleOpenCreateModal}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <AdminStatsCard
          title="Tổng yêu cầu"
          value={stats.total}
          icon={LifeBuoy}
          color="blue"
          description="Tất cả yêu cầu đang được theo dõi"
        />
        <AdminStatsCard
          title="Ưu tiên cao"
          value={stats.urgent}
          icon={AlertTriangle}
          color="red"
          description="Cần xử lý khẩn cấp"
        />
        <AdminStatsCard
          title="Đang xử lý"
          value={stats.inProgress}
          icon={Clock}
          color="orange"
          description="Đang điều phối nguồn lực"
        />
        <AdminStatsCard
          title="Hoàn thành"
          value={stats.completed}
          icon={CheckCircle2}
          color="green"
          description="Đã giải quyết thành công"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải danh sách yêu cầu..."
          className="min-h-[320px]"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={paginatedRequests}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Tìm kiếm theo loại yêu cầu, người gửi hoặc mô tả..."
          onSearch={setSearchQuery}
          filters={[
            {
              key: "priority",
              label: "Lọc theo ưu tiên",
              options: [
                { value: "all", label: "Tất cả mức ưu tiên" },
                ...prioritySelectOptions,
              ],
              onChange: (value) => setPriorityFilter(value === "all" ? "all" : value),
            },
            {
              key: "status",
              label: "Lọc theo trạng thái",
              options: [
                { value: "all", label: "Tất cả trạng thái" },
                ...statusSelectOptions,
              ],
              onChange: (value) => setStatusFilter(value === "all" ? "all" : value),
            },
          ]}
          toolbarActions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              startIcon={<RefreshCcw className="w-4 h-4" />}
            >
              Tải lại
            </Button>
          }
          emptyMessage="Không có yêu cầu nào"
          emptyDescription="Hiện chưa có yêu cầu phù hợp với bộ lọc."
          emptyIcon={<FileText className="h-5 w-5" />}
        />
      )}

      {!isLoading && filteredRequests.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60 md:flex-row">
          <span className="text-gray-600 dark:text-gray-300">
            Hiển thị {paginatedRequests.length} / {filteredRequests.length} yêu cầu
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              startIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Trước
            </Button>
            <span className="text-gray-600 dark:text-gray-300">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              endIcon={<ChevronRight className="h-4 w-4" />}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Thêm yêu cầu cứu trợ mới"
        description="Nhập thông tin yêu cầu theo dữ liệu của hệ thống"
        size="lg"
        className="max-h-[90vh]"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseCreateModal}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateRequest}
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? "Đang tạo..." : "Tạo yêu cầu"}
            </Button>
          </>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {createError && (
            <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
              {createError}
            </div>
          )}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Loại yêu cầu
            </label>
            <Input
              value={createForm.loai_yeu_cau}
              onChange={(e) => handleCreateFormChange("loai_yeu_cau", e.target.value)}
              placeholder="Ví dụ: Thực phẩm khẩn cấp"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Người gửi yêu cầu
            </label>
            <Select
              key={`create-user-${selectedUserId || "none"}`}
              options={
                userOptions.length > 0
                  ? userOptions
                  : [{ value: "", label: usersLoading ? "Đang tải..." : "Chưa có dữ liệu" }]
              }
              placeholder="Chọn người gửi"
              defaultValue={selectedUserId}
              onChange={(value) => setSelectedUserId(value)}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {selectedUser
                ? `Đang chọn: ${selectedUser.ho_va_ten || selectedUser.email || `Người dùng #${selectedUser.id}`}`
                : "Chưa chọn người gửi"}
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Số người ảnh hưởng
            </label>
            <Input
              type="number"
              value={createForm.so_nguoi}
              onChange={(e) => handleCreateFormChange("so_nguoi", e.target.value)}
              placeholder="Nhập số người"
              min="1"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ưu tiên
            </label>
            <Select
              key={`create-priority-${createForm.do_uu_tien}`}
              options={prioritySelectOptions}
              placeholder="Chọn mức ưu tiên"
              defaultValue={createForm.do_uu_tien}
              onChange={(value) => handleCreateFormChange("do_uu_tien", value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Trạng thái
            </label>
            <Select
              key={`create-status-${createForm.trang_thai}`}
              options={statusSelectOptions}
              placeholder="Chọn trạng thái"
              defaultValue={createForm.trang_thai}
              onChange={(value) => handleCreateFormChange("trang_thai", value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mô tả chi tiết
            </label>
            <textarea
              value={createForm.mo_ta}
              onChange={(e) => handleCreateFormChange("mo_ta", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Nhập mô tả ngắn gọn về tình hình cần cứu trợ..."
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vị trí trên bản đồ
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Nhấp vào bản đồ bên dưới để chọn vị trí chính xác
              </span>
            </div>
            <MapLocationPicker
              value={createLocation}
              onChange={handleCreateLocationChange}
              isActive={isCreateModalOpen}
            />
            <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {createLocation
                  ? `Vị trí đã chọn: ${createLocation.lat.toFixed(4)}, ${createLocation.lng.toFixed(4)}`
                  : "Chưa chọn vị trí"}
              </span>
              {createLocation && (
                <button
                  type="button"
                  onClick={() => handleCreateLocationChange(null)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Xóa vị trí
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={Boolean(selectedRequest)}
        onClose={handleCloseDetail}
        title={
          selectedRequest
            ? `Chi tiết yêu cầu #${selectedRequest.id}`
            : "Chi tiết yêu cầu"
        }
        description={
          selectedRequest?.loai_yeu_cau
            ? `Loại yêu cầu: ${selectedRequest.loai_yeu_cau}`
            : undefined
        }
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseDetail}>
              Đóng
            </Button>
            <Button
              onClick={handleUpdateRequest}
              disabled={updateRequestMutation.isPending || !hasUpdateChanges}
            >
              {updateRequestMutation.isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
            {updateError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                {updateError}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={getPriorityColor(selectedRequest.do_uu_tien)} size="sm">
                Ưu tiên: {translatePriority(selectedRequest.do_uu_tien)}
              </Badge>
              <Badge color={getRequestStatusColor(selectedRequest.trang_thai)} size="sm">
                Trạng thái: {translateRequestStatus(selectedRequest.trang_thai)}
              </Badge>
              <Badge color="info" size="sm">
                {selectedRequest.phan_phois?.length || 0} phân phối liên quan
              </Badge>
            </div>

            <div className="grid grid-cols-12 gap-4 md:grid-cols-6 lg:grid-cols-4">
            <div className="space-y-4 lg:col-span-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thông tin người liên hệ
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">
                          {selectedRequest.nguoi_dung?.ho_va_ten || "Không xác định"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Người tạo yêu cầu
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p>{selectedRequest.nguoi_dung?.email || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Số điện thoại
                      </p>
                      <p>{selectedRequest.nguoi_dung?.so_dien_thoai || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 lg:col-span-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thông tin yêu cầu
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mô tả
                      </p>
                      <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                        {selectedRequest.mo_ta || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Số người ảnh hưởng
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedRequest.so_nguoi.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ngày tạo
                      </p>
                      <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                        {format(new Date(selectedRequest.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vị trí
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>
                          {updateLocation
                            ? `${updateLocation.lat.toFixed(4)}, ${updateLocation.lng.toFixed(4)}`
                            : selectedRequest.vi_do !== null &&
                              selectedRequest.vi_do !== undefined &&
                              selectedRequest.kinh_do !== null &&
                              selectedRequest.kinh_do !== undefined
                            ? `${Number(selectedRequest.vi_do).toFixed(4)}, ${Number(selectedRequest.kinh_do).toFixed(4)}`
                            : "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Vị trí trên bản đồ
                  </h3>
                  <div className="mt-4 space-y-3">
                    <MapLocationPicker
                      value={updateLocation}
                      onChange={handleUpdateLocationChange}
                      isActive={Boolean(selectedRequest)}
                    />
                    <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        {updateLocation
                          ? `Vĩ độ: ${updateLocation.lat.toFixed(4)}, Kinh độ: ${updateLocation.lng.toFixed(4)}`
                          : "Chưa chọn vị trí"}
                      </span>
                      {updateLocation && (
                        <button
                          type="button"
                          onClick={() => handleUpdateLocationChange(null)}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Xóa vị trí
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cập nhật xử lý
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ưu tiên
                      </label>
                      <Select
                        key={`detail-priority-${selectedRequest.id}-${updatePriority}`}
                        options={prioritySelectOptions}
                        placeholder="Chọn ưu tiên"
                        defaultValue={updatePriority}
                        onChange={(value) => setUpdatePriority(value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trạng thái
                      </label>
                      <Select
                        key={`detail-status-${selectedRequest.id}-${updateStatus}`}
                        options={statusSelectOptions}
                        placeholder="Chọn trạng thái"
                        defaultValue={updateStatus}
                        onChange={(value) => setUpdateStatus(value)}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Lưu ý: Cập nhật ưu tiên, trạng thái và vị trí sẽ hiển thị ngay trong bảng quản trị và bản đồ cứu trợ.
                  </p>
                </div>

                {selectedRequest.phan_phois && selectedRequest.phan_phois.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Phân phối liên quan
                    </h3>
                    <div className="mt-4 space-y-3">
                      {selectedRequest.phan_phois.map((distribution) => (
                        <div
                          key={distribution.id}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-white/[0.04] dark:bg-white/[0.02]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                Phân phối #{distribution.id}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Nguồn lực:{" "}
                                {distribution.nguon_luc?.ten_nguon_luc || "Chưa cập nhật"}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Tình nguyện viên:{" "}
                                {distribution.tinh_nguyen_vien?.ho_va_ten || "Chưa phân công"}
                              </p>
                            </div>
                            <Badge color="info" size="sm">
                              {translateDistributionStatus(distribution.trang_thai)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
