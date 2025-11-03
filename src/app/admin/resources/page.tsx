"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Package,
  Plus,
  RefreshCcw,
  Store,
  ClipboardList,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import MapLocationPicker from "@/components/admin/MapLocationPicker";
import { useResources, useCreateResource, AdminResource } from "@/hooks/useResources";
import { useCenters, AdminCenter } from "@/hooks/useCenters";
import { useToast } from "@/context/ToastContext";

type ResourceForm = {
  ten_nguon_luc: string;
  loai: string;
  so_luong: string;
  don_vi: string;
  id_trung_tam: string;
};

const initialForm: ResourceForm = {
  ten_nguon_luc: "",
  loai: "",
  so_luong: "",
  don_vi: "",
  id_trung_tam: "",
};

export default function AdminResourcesPage() {
  const { error: showError } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ResourceForm>(initialForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<AdminResource | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [centerFilter, setCenterFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { data: resourcesData, isLoading, refetch } = useResources();
  const { data: centersData } = useCenters();
  const createResource = useCreateResource();

  const resources = useMemo(
    () => ((resourcesData?.resources || []) as AdminResource[]),
    [resourcesData],
  );

  const centers = useMemo(
    () => ((centersData?.centers || []) as AdminCenter[]),
    [centersData],
  );

  const centerOptions = useMemo(
    () =>
      centers.map((center) => ({
        value: String(center.id),
        label: center.ten_trung_tam,
      })),
    [centers],
  );

  const resourceTypes = useMemo(
    () => Array.from(new Set(resources.map((item) => item.loai).filter(Boolean))),
    [resources],
  );

  useEffect(() => {
    if (isCreateModalOpen && !createForm.id_trung_tam && centerOptions.length > 0) {
      setCreateForm((prev) => ({
        ...prev,
        id_trung_tam: centerOptions[0].value,
      }));
    }
  }, [centerOptions, createForm.id_trung_tam, isCreateModalOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, centerFilter]);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesQuery =
        !query ||
        [resource.ten_nguon_luc, resource.loai, resource.trung_tam?.ten_trung_tam]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      const matchesType =
        typeFilter === "all" || resource.loai === typeFilter;

      const matchesCenter =
        centerFilter === "all" ||
        String(resource.id_trung_tam) === centerFilter;

      return matchesQuery && matchesType && matchesCenter;
    });
  }, [resources, searchQuery, typeFilter, centerFilter]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = resources.length;
    const totalQuantity = resources.reduce((sum, item) => sum + item.so_luong, 0);
    const uniqueTypes = resourceTypes.length;
    return {
      total,
      totalQuantity,
      uniqueTypes,
    };
  }, [resources, resourceTypes]);

  const columns = useMemo(
    () => [
      {
        key: "ten_nguon_luc",
        label: "Nguồn lực",
        render: (_: string, row: AdminResource) => (
          <div className="space-y-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {row.ten_nguon_luc}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.don_vi}
            </p>
          </div>
        ),
      },
      {
        key: "loai",
        label: "Loại",
        render: (value: string) => (
          <Badge color="info" size="sm">
            {value || "Không xác định"}
          </Badge>
        ),
      },
      {
        key: "so_luong",
        label: "Số lượng",
        render: (value: number, row: AdminResource) => (
          <span className="text-sm text-gray-800 dark:text-gray-200">
            {value.toLocaleString()} {row.don_vi}
          </span>
        ),
      },
      {
        key: "trung_tam",
        label: "Thuộc trung tâm",
        render: (value: AdminResource["trung_tam"]) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {value?.ten_trung_tam || "Chưa phân bổ"}
            </p>
            {value?.dia_chi && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {value.dia_chi}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: AdminResource) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedResource(row)}
            startIcon={<ClipboardList className="h-4 w-4" />}
          >
            Chi tiết
          </Button>
        ),
      },
    ],
    [],
  );

  const handleCreateFormChange = (key: keyof ResourceForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateResource = () => {
    if (!createForm.ten_nguon_luc.trim()) {
      setCreateError("Vui lòng nhập tên nguồn lực.");
      showError("Vui lòng nhập tên nguồn lực.");
      return;
    }

    if (!createForm.loai.trim()) {
      setCreateError("Vui lòng nhập hoặc chọn loại nguồn lực.");
      showError("Vui lòng nhập hoặc chọn loại nguồn lực.");
      return;
    }

    const quantity = Number(createForm.so_luong);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setCreateError("Số lượng phải lớn hơn 0.");
      showError("Số lượng phải lớn hơn 0.");
      return;
    }

    if (!createForm.don_vi.trim()) {
      setCreateError("Vui lòng nhập đơn vị đo lường.");
      showError("Vui lòng nhập đơn vị đo lường.");
      return;
    }

    if (!createForm.id_trung_tam) {
      setCreateError("Vui lòng chọn trung tâm lưu trữ.");
      showError("Vui lòng chọn trung tâm lưu trữ.");
      return;
    }

    setCreateError(null);

    createResource.mutate(
      {
        ten_nguon_luc: createForm.ten_nguon_luc.trim(),
        loai: createForm.loai.trim(),
        so_luong: quantity,
        don_vi: createForm.don_vi.trim(),
        id_trung_tam: Number(createForm.id_trung_tam),
      },
      {
        onSuccess: () => {
          setCreateForm(initialForm);
          setIsCreateModalOpen(false);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể tạo nguồn lực.";
          setCreateError(message);
        },
      },
    );
  };

  const detailLocation = useMemo(() => {
    if (!selectedResource?.trung_tam) return null;
    const { vi_do, kinh_do } = selectedResource.trung_tam;
    if (
      vi_do === undefined ||
      vi_do === null ||
      kinh_do === undefined ||
      kinh_do === null
    ) {
      return null;
    }
    const lat = Number(vi_do);
    const lng = Number(kinh_do);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [selectedResource]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý nguồn lực"
        description="Theo dõi kho và phân bổ nguồn lực cứu trợ"
        showAddButton
        addButtonText="+ Thêm nguồn lực"
        onAdd={() => {
          setCreateForm(initialForm);
          setCreateError(null);
          setIsCreateModalOpen(true);
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatsCard
          title="Tổng nguồn lực"
          value={stats.total}
          icon={Package}
          color="blue"
          description="Tổng số bản ghi đang theo dõi"
        />
        <AdminStatsCard
          title="Số lượng tích trữ"
          value={stats.totalQuantity}
          icon={Box}
          color="green"
          description="Tổng số đơn vị trong kho"
        />
        <AdminStatsCard
          title="Nhóm vật tư"
          value={stats.uniqueTypes}
          icon={Store}
          color="orange"
          description="Số loại nguồn lực khác nhau"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải danh sách nguồn lực..."
          className="min-h-[320px]"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={paginatedResources}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Tìm theo tên nguồn lực, loại hoặc trung tâm..."
          onSearch={setSearchQuery}
          filters={[
            {
              key: "type",
              label: "Lọc theo loại",
              options: [
                { value: "all", label: "Tất cả loại" },
                ...resourceTypes.map((item) => ({ value: item, label: item })),
              ],
              onChange: (value) => setTypeFilter(value),
            },
            {
              key: "center",
              label: "Lọc theo trung tâm",
              options: [
                { value: "all", label: "Tất cả trung tâm" },
                ...centerOptions,
              ],
              onChange: (value) => setCenterFilter(value),
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
          emptyMessage="Chưa có nguồn lực nào"
          emptyDescription="Hãy thêm nguồn lực đầu tiên để quản lý kho cứu trợ."
          emptyIcon={<Package className="h-6 w-6" aria-hidden />}
          emptyAction={
            <Button startIcon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateModalOpen(true)}>
              Thêm nguồn lực
            </Button>
          }
        />
      )}

      {!isLoading && filteredResources.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60 md:flex-row">
          <span className="text-gray-600 dark:text-gray-300">
            Hiển thị {paginatedResources.length} / {filteredResources.length} nguồn lực
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
        title="Thêm nguồn lực mới"
        description="Khai báo thông tin nguồn lực và kho lưu trữ."
        size="lg"
        className="max-h-[90vh]"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateResource} disabled={createResource.isPending}>
              {createResource.isPending ? "Đang tạo..." : "Thêm nguồn lực"}
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
                Tên nguồn lực
              </label>
              <Input
                value={createForm.ten_nguon_luc}
                onChange={(e) => handleCreateFormChange("ten_nguon_luc", e.target.value)}
                placeholder="Ví dụ: Lương thực dự trữ"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Loại nguồn lực
              </label>
              <Input
                value={createForm.loai}
                onChange={(e) => handleCreateFormChange("loai", e.target.value)}
                placeholder="Ví dụ: Thực phẩm, Y tế..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Đơn vị
              </label>
              <Input
                value={createForm.don_vi}
                onChange={(e) => handleCreateFormChange("don_vi", e.target.value)}
                placeholder="Ví dụ: kg, thùng, bộ..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Số lượng
              </label>
              <Input
                type="number"
                min="1"
                value={createForm.so_luong}
                onChange={(e) => handleCreateFormChange("so_luong", e.target.value)}
                placeholder="Nhập số lượng"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trung tâm lưu trữ
              </label>
              <Select
                key={`create-center-${createForm.id_trung_tam || "default"}`}
                options={
                  centerOptions.length > 0
                    ? centerOptions
                    : [{ value: "", label: "Chưa có trung tâm" }]
                }
                placeholder="Chọn trung tâm"
                defaultValue={createForm.id_trung_tam}
                onChange={(value) => handleCreateFormChange("id_trung_tam", value)}
              />
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={Boolean(selectedResource)}
        onClose={() => setSelectedResource(null)}
        title={
          selectedResource
            ? `Nguồn lực: ${selectedResource.ten_nguon_luc}`
            : "Chi tiết nguồn lực"
        }
        description={
          selectedResource?.trung_tam?.ten_trung_tam
            ? `Thuộc trung tâm: ${selectedResource.trung_tam.ten_trung_tam}`
            : undefined
        }
        size="lg"
      >
        {selectedResource ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="info" size="sm">
                Loại: {selectedResource.loai}
              </Badge>
              <Badge color="blue" size="sm">
                {selectedResource.so_luong.toLocaleString()} {selectedResource.don_vi}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thông tin nguồn lực
                </h3>
                <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                  <p>
                    <span className="font-medium">Tên nguồn lực:</span>{" "}
                    {selectedResource.ten_nguon_luc}
                  </p>
                  <p>
                    <span className="font-medium">Loại:</span> {selectedResource.loai}
                  </p>
                  <p>
                    <span className="font-medium">Số lượng:</span>{" "}
                    {selectedResource.so_luong.toLocaleString()} {selectedResource.don_vi}
                  </p>
                  <p>
                    <span className="font-medium">Trung tâm lưu trữ:</span>{" "}
                    {selectedResource.trung_tam?.ten_trung_tam || "Chưa phân bổ"}
                  </p>
                  {selectedResource.trung_tam?.dia_chi && (
                    <p>
                      <span className="font-medium">Địa chỉ:</span>{" "}
                      {selectedResource.trung_tam.dia_chi}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vị trí trung tâm
                </h3>
                <div className="mt-4 space-y-3">
                  <MapLocationPicker
                    value={detailLocation}
                    onChange={() => {}}
                    isActive={Boolean(selectedResource)}
                    interactive={false}
                    markerColor="#0EA5E9"
                    instructions="Vị trí trung tâm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bản đồ chỉ hiển thị khi trung tâm có thiết lập tọa độ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={<Package className="h-6 w-6" aria-hidden />}
            title="Không tìm thấy nguồn lực"
            description="Hãy chọn một nguồn lực bất kỳ để xem chi tiết."
            variant="subtle"
            compact
          />
        )}
      </AdminModal>
    </div>
  );
}
