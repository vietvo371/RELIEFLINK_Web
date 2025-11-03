"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  Package,
  RefreshCcw,
  Truck,
  ClipboardList,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";
import { useDistributions, useCreateDistribution, AdminDistribution } from "@/hooks/useDistributions";
import { useRequests } from "@/hooks/useRequests";
import { useResources } from "@/hooks/useResources";
import { useUsers, AdminUser } from "@/hooks/useUsers";
import { useToast } from "@/context/ToastContext";
import {
  translateDistributionStatus,
  translatePriority,
  getDistributionStatusColor,
} from "@/lib/translations";

type DistributionForm = {
  requestId: string;
  resourceId: string;
  volunteerId: string;
  status: string;
  dispatchTime: string;
};

type RequestSummary = {
  id: number;
  loai_yeu_cau: string;
  do_uu_tien: string;
  vi_do?: number | string | null;
  kinh_do?: number | string | null;
  nguoi_dung?: {
    ho_va_ten?: string | null;
    so_dien_thoai?: string | null;
    email?: string | null;
  } | null;
};

const initialForm: DistributionForm = {
  requestId: "",
  resourceId: "",
  volunteerId: "",
  status: "dang_chuan_bi",
  dispatchTime: "",
};

export default function AdminDistributionsPage() {
  const { error: showError, success: showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [volunteerFilter, setVolunteerFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<DistributionForm>(initialForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedDistribution, setSelectedDistribution] = useState<AdminDistribution | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: distributionsData, isLoading, refetch } = useDistributions(
    statusFilter !== "all" ? { trang_thai: statusFilter } : undefined,
  );

  const { data: requestsData } = useRequests();
  const { data: resourcesData } = useResources();
  const { data: volunteerData } = useUsers("tinh_nguyen_vien");
  const createDistribution = useCreateDistribution();

  const distributions = useMemo(
    () => ((distributionsData?.distributions || []) as AdminDistribution[]),
    [distributionsData],
  );

  const requests = useMemo(
    () => ((requestsData?.requests || []) as RequestSummary[]),
    [requestsData],
  );
  const resources = useMemo(
    () => ((resourcesData?.resources || []) as AdminResource[]),
    [resourcesData],
  );
  const volunteers = useMemo(
    () => ((volunteerData?.users || []) as AdminUser[]),
    [volunteerData],
  );

  const requestOptions = useMemo(
    () =>
      requests.map((req) => ({
        value: String(req.id),
        label: `${req.loai_yeu_cau} (#${req.id})`,
      })),
    [requests],
  );

  const resourceOptions = useMemo(
    () =>
      resources.map((res) => ({
        value: String(res.id),
        label: `${res.ten_nguon_luc} (${res.don_vi})`,
      })),
    [resources],
  );

  const volunteerOptions = useMemo(
    () =>
      volunteers.map((vol) => ({
        value: String(vol.id),
        label: vol.ho_va_ten || vol.email || `Tình nguyện viên #${vol.id}`,
      })),
    [volunteers],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, volunteerFilter]);

  useEffect(() => {
    if (isCreateModalOpen) {
      setCreateForm((prev) => ({
        ...prev,
        requestId: prev.requestId || (requestOptions[0]?.value ?? ""),
        resourceId: prev.resourceId || (resourceOptions[0]?.value ?? ""),
        volunteerId: prev.volunteerId || (volunteerOptions[0]?.value ?? ""),
      }));
    }
  }, [isCreateModalOpen, requestOptions, resourceOptions, volunteerOptions]);

  const filteredDistributions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return distributions.filter((dist) => {
      const matchesQuery =
        !query ||
        [
          dist.yeu_cau?.loai_yeu_cau,
          dist.nguon_luc?.ten_nguon_luc,
          dist.tinh_nguyen_vien?.ho_va_ten,
          dist.ma_giao_dich,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      const matchesVolunteer =
        volunteerFilter === "all" ||
        (dist.tinh_nguyen_vien && String(dist.tinh_nguyen_vien.id) === volunteerFilter);

      return matchesQuery && matchesVolunteer;
    });
  }, [distributions, searchQuery, volunteerFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDistributions.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedDistributions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDistributions.slice(start, start + pageSize);
  }, [filteredDistributions, currentPage]);

  const stats = useMemo(() => {
    const total = distributions.length;
    const completed = distributions.filter((dist) => dist.trang_thai === "hoan_thanh").length;
    const inTransit = distributions.filter((dist) =>
      ["dang_van_chuyen", "dang_giao"].includes(dist.trang_thai),
    ).length;
    const totalLogs = distributions.reduce(
      (sum, dist) => sum + (dist.nhat_ky_blockchains?.length || 0),
      0,
    );
    return {
      total,
      completed,
      inTransit,
      totalLogs,
    };
  }, [distributions]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (value: number) => `#${value}`,
      },
      {
        key: "yeu_cau",
        label: "Yêu cầu",
        render: (_: unknown, row: AdminDistribution) => (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.yeu_cau?.loai_yeu_cau || "-"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ưu tiên: {translatePriority(row.yeu_cau?.do_uu_tien || "")}
            </p>
          </div>
        ),
      },
      {
        key: "nguon_luc",
        label: "Nguồn lực",
        render: (_: unknown, row: AdminDistribution) => (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.nguon_luc?.ten_nguon_luc || "-"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.nguon_luc?.don_vi}
            </p>
          </div>
        ),
      },
      {
        key: "tinh_nguyen_vien",
        label: "Tình nguyện viên",
        render: (_: unknown, row: AdminDistribution) => (
          <div className="space-y-1">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {row.tinh_nguyen_vien?.ho_va_ten || "Chưa phân công"}
            </p>
            {row.tinh_nguyen_vien?.so_dien_thoai && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.tinh_nguyen_vien.so_dien_thoai}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "trang_thai",
        label: "Trạng thái",
        render: (value: string) => (
          <Badge color={getDistributionStatusColor(value)} size="sm">
            {translateDistributionStatus(value)}
          </Badge>
        ),
      },
      {
        key: "ma_giao_dich",
        label: "TX Hash",
        render: (value?: string | null) => value || "-",
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: AdminDistribution) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedDistribution(row)}
            startIcon={<ClipboardList className="h-4 w-4" />}
          >
            Chi tiết
          </Button>
        ),
      },
    ],
    [],
  );

  const handleCreateFormChange = (key: keyof DistributionForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateDistribution = () => {
    if (!createForm.requestId) {
      setCreateError("Vui lòng chọn yêu cầu cần hỗ trợ.");
      showError("Vui lòng chọn yêu cầu cần hỗ trợ.");
      return;
    }
    if (!createForm.resourceId) {
      setCreateError("Vui lòng chọn nguồn lực phân bổ.");
      showError("Vui lòng chọn nguồn lực phân bổ.");
      return;
    }
    if (!createForm.volunteerId) {
      setCreateError("Vui lòng chọn tình nguyện viên phụ trách.");
      showError("Vui lòng chọn tình nguyện viên phụ trách.");
      return;
    }

    setCreateError(null);

    createDistribution.mutate(
      {
        id_yeu_cau: Number(createForm.requestId),
        id_nguon_luc: Number(createForm.resourceId),
        id_tinh_nguyen_vien: Number(createForm.volunteerId),
        trang_thai: createForm.status,
        thoi_gian_xuat: createForm.dispatchTime || undefined,
      },
      {
        onSuccess: () => {
          setCreateForm(initialForm);
          setIsCreateModalOpen(false);
          showSuccess("Tạo phân phối thành công!");
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể tạo phân phối.";
          setCreateError(message);
          showError(message);
        },
      },
    );
  };

  const detailRequestLocation = useMemo(() => {
    if (!selectedDistribution) return null;
    const { vi_do, kinh_do } = selectedDistribution.yeu_cau || {};
    if (vi_do === null || vi_do === undefined || kinh_do === null || kinh_do === undefined) {
      return null;
    }
    const lat = Number(vi_do);
    const lng = Number(kinh_do);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng } as Coordinates;
  }, [selectedDistribution]);

  const detailCenterLocation = useMemo(() => {
    if (!selectedDistribution?.nguon_luc?.trung_tam) return null;
    const { vi_do, kinh_do } = selectedDistribution.nguon_luc.trung_tam;
    if (vi_do === null || vi_do === undefined || kinh_do === null || kinh_do === undefined) {
      return null;
    }
    const lat = Number(vi_do);
    const lng = Number(kinh_do);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng } as Coordinates;
  }, [selectedDistribution]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý phân phối"
        description="Theo dõi tiến độ vận chuyển và lịch sử phân phối nguồn lực"
        showAddButton
        addButtonText="Tạo phân phối"
        onAdd={() => {
          setCreateForm(initialForm);
          setCreateError(null);
          setIsCreateModalOpen(true);
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatsCard
          title="Tổng phân phối"
          value={stats.total}
          icon={Truck}
          color="blue"
          description="Tất cả lô hàng đã tạo"
        />
        <AdminStatsCard
          title="Đang vận chuyển"
          value={stats.inTransit}
          icon={Box}
          color="orange"
          description="Đang trên đường tới điểm nhận"
        />
        <AdminStatsCard
          title="Hoàn thành"
          value={stats.completed}
          icon={Package}
          color="green"
          description="Đã giao thành công"
        />
        <AdminStatsCard
          title="Log blockchain"
          value={stats.totalLogs}
          icon={AlertTriangle}
          color="purple"
          description="Số bản ghi xác thực"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải danh sách phân phối..."
          className="min-h-[320px]"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={paginatedDistributions}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Tìm theo yêu cầu, nguồn lực, tình nguyện viên..."
          onSearch={setSearchQuery}
          filters={[
            {
              key: "status",
              label: "Trạng thái",
              options: [
                { value: "all", label: "Tất cả" },
                { value: "dang_chuan_bi", label: translateDistributionStatus("dang_chuan_bi") },
                { value: "dang_van_chuyen", label: translateDistributionStatus("dang_van_chuyen") },
                { value: "dang_giao", label: translateDistributionStatus("dang_giao") },
                { value: "hoan_thanh", label: translateDistributionStatus("hoan_thanh") },
                { value: "huy_bo", label: translateDistributionStatus("huy_bo") },
              ],
              onChange: setStatusFilter,
            },
            {
              key: "volunteer",
              label: "Tình nguyện viên",
              options: [
                { value: "all", label: "Tất cả" },
                ...volunteerOptions,
              ],
              onChange: setVolunteerFilter,
            },
          ]}
          toolbarActions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              startIcon={<RefreshCcw className="h-4 w-4" />}
            >
              Tải lại
            </Button>
          }
          emptyMessage="Chưa có phân phối nào"
          emptyDescription="Tạo bản ghi đầu tiên để bắt đầu theo dõi tiến trình vận chuyển."
          emptyIcon={<Truck className="h-6 w-6" aria-hidden />}
          emptyAction={
            <Button startIcon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateModalOpen(true)}>
              Tạo phân phối mới
            </Button>
          }
        />
      )}

      {!isLoading && filteredDistributions.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60 md:flex-row">
          <span className="text-gray-600 dark:text-gray-300">
            Hiển thị {paginatedDistributions.length} / {filteredDistributions.length} phân phối
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="text-gray-600 dark:text-gray-300">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo phân phối mới"
        description="Gán nguồn lực, yêu cầu và tình nguyện viên phụ trách"
        size="lg"
        className="max-h-[90vh]"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateDistribution} disabled={createDistribution.isPending}>
              {createDistribution.isPending ? "Đang tạo..." : "Tạo phân phối"}
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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Yêu cầu cứu trợ
              </label>
              <Select
                key={`create-request-${createForm.requestId || "default"}`}
                options={
                  requestOptions.length > 0
                    ? requestOptions
                    : [{ value: "", label: "Chưa có yêu cầu" }]
                }
                placeholder="Chọn yêu cầu"
                defaultValue={createForm.requestId}
                onChange={(value) => handleCreateFormChange("requestId", value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nguồn lực phân bổ
              </label>
              <Select
                key={`create-resource-${createForm.resourceId || "default"}`}
                options={
                  resourceOptions.length > 0
                    ? resourceOptions
                    : [{ value: "", label: "Chưa có nguồn lực" }]
                }
                placeholder="Chọn nguồn lực"
                defaultValue={createForm.resourceId}
                onChange={(value) => handleCreateFormChange("resourceId", value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tình nguyện viên
              </label>
              <Select
                key={`create-volunteer-${createForm.volunteerId || "default"}`}
                options={
                  volunteerOptions.length > 0
                    ? volunteerOptions
                    : [{ value: "", label: "Chưa có tình nguyện viên" }]
                }
                placeholder="Chọn tình nguyện viên"
                defaultValue={createForm.volunteerId}
                onChange={(value) => handleCreateFormChange("volunteerId", value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái
              </label>
              <Select
                key={`create-status-${createForm.status}`}
                options={[
                  { value: "dang_chuan_bi", label: translateDistributionStatus("dang_chuan_bi") },
                  { value: "dang_van_chuyen", label: translateDistributionStatus("dang_van_chuyen") },
                  { value: "dang_giao", label: translateDistributionStatus("dang_giao") },
                  { value: "hoan_thanh", label: translateDistributionStatus("hoan_thanh") },
                  { value: "huy_bo", label: translateDistributionStatus("huy_bo") },
                ]}
                placeholder="Chọn trạng thái"
                defaultValue={createForm.status}
                onChange={(value) => handleCreateFormChange("status", value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Thời gian xuất kho
              </label>
              <input
                type="datetime-local"
                value={createForm.dispatchTime}
                onChange={(e) => handleCreateFormChange("dispatchTime", e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Để trống nếu chưa xác định thời gian xuất kho
              </p>
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={Boolean(selectedDistribution)}
        onClose={() => setSelectedDistribution(null)}
        title={
          selectedDistribution
            ? `Phân phối #${selectedDistribution.id}`
            : "Chi tiết phân phối"
        }
        description={selectedDistribution?.ma_giao_dich ? `TX Hash: ${selectedDistribution.ma_giao_dich}` : undefined}
        size="xl"
        className="max-h-[90vh]"
      >
        {selectedDistribution ? (
          <div className="max-h-[75vh] space-y-6 overflow-y-auto pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={getDistributionStatusColor(selectedDistribution.trang_thai)} size="sm">
                {translateDistributionStatus(selectedDistribution.trang_thai)}
              </Badge>
              {selectedDistribution.thoi_gian_xuat && (
                <Badge color="info" size="sm">
                  Xuất kho: {format(new Date(selectedDistribution.thoi_gian_xuat), "dd/MM/yyyy HH:mm")}
                </Badge>
              )}
              {selectedDistribution.thoi_gian_giao && (
                <Badge color="success" size="sm">
                  Giao: {format(new Date(selectedDistribution.thoi_gian_giao), "dd/MM/yyyy HH:mm")}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thông tin phân phối
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Yêu cầu cứu trợ</p>
                      <p>{selectedDistribution.yeu_cau?.loai_yeu_cau || "-"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ưu tiên: {translatePriority(selectedDistribution.yeu_cau?.do_uu_tien || "")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Nguồn lực</p>
                      <p>{selectedDistribution.nguon_luc?.ten_nguon_luc || "-"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Loại: {selectedDistribution.nguon_luc?.loai || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Tình nguyện viên</p>
                      <p>{selectedDistribution.tinh_nguyen_vien?.ho_va_ten || "Chưa phân công"}</p>
                      {selectedDistribution.tinh_nguyen_vien?.so_dien_thoai && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedDistribution.tinh_nguyen_vien.so_dien_thoai}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Nhật ký blockchain
                  </h3>
                  <div className="mt-4 space-y-3">
                    {selectedDistribution.nhat_ky_blockchains?.length ? (
                      selectedDistribution.nhat_ky_blockchains.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 text-sm text-gray-700 dark:border-white/[0.04] dark:bg-white/[0.02] dark:text-gray-200"
                        >
                          <p className="font-medium">{log.hanh_dong}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(log.thoi_gian), "dd/MM/yyyy HH:mm")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            TX: {log.ma_giao_dich}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chưa có bản ghi blockchain cho phân phối này.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Vị trí yêu cầu
                  </h3>
                  <MapLocationPicker
                    value={detailRequestLocation}
                    onChange={() => {}}
                    isActive={Boolean(selectedDistribution)}
                    interactive={false}
                    markerColor="#EF4444"
                    instructions="Vị trí điểm nhận"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Bản đồ hiển thị nếu yêu cầu có tọa độ.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Kho nguồn lực
                  </h3>
                  <MapLocationPicker
                    value={detailCenterLocation}
                    onChange={() => {}}
                    isActive={Boolean(selectedDistribution)}
                    interactive={false}
                    markerColor="#10B981"
                    instructions="Vị trí trung tâm"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Hiển thị vị trí trung tâm xuất hàng (nếu có tọa độ).
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={<Truck className="h-6 w-6" aria-hidden />}
            title="Không tìm thấy phân phối"
            description="Chọn một bản ghi để xem chi tiết."
            variant="subtle"
            compact
          />
        )}
      </AdminModal>
    </div>
  );
}
