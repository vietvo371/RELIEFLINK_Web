"use client";

import { useMemo, useState } from "react";
import { Building2, MapPin, Plus, Users, Phone, Warehouse, ClipboardList, Package } from "lucide-react";
import { useCenters, useCreateCenter, AdminCenter } from "@/hooks/useCenters";
import { useResources, AdminResource } from "@/hooks/useResources";
import { useToast } from "@/context/ToastContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";

type CenterForm = {
  ten_trung_tam: string;
  dia_chi: string;
  nguoi_quan_ly: string;
  so_lien_he: string;
};

const initialForm: CenterForm = {
  ten_trung_tam: "",
  dia_chi: "",
  nguoi_quan_ly: "",
  so_lien_he: "",
};

export default function AdminCentersPage() {
  const { error: showError } = useToast();
  const { data: centersData, isLoading } = useCenters();
  const { data: resourcesData } = useResources();
  const createCenter = useCreateCenter();

  const centers = useMemo(
    () => ((centersData?.centers || []) as AdminCenter[]),
    [centersData],
  );

  const resources = useMemo(
    () => ((resourcesData?.resources || []) as AdminResource[]),
    [resourcesData],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CenterForm>(initialForm);
  const [createLocation, setCreateLocation] = useState<Coordinates | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<AdminCenter | null>(null);

  const stats = useMemo(() => {
    const total = centers.length;
    const totalWithResources = centers.filter((center) => center.nguon_lucs?.length > 0).length;
    const resourcesCount = resources.length;
    return {
      total,
      totalWithResources,
      resourcesCount,
    };
  }, [centers, resources]);

  const filteredCenters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return centers;
    return centers.filter((center) =>
      [
        center.ten_trung_tam,
        center.dia_chi,
        center.nguoi_quan_ly,
        center.so_lien_he,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [centers, searchQuery]);

  const columns = useMemo(
    () => [
      {
        key: "ten_trung_tam",
        label: "Tên trung tâm",
        render: (value: string, row: AdminCenter) => (
          <div className="space-y-1">
            <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.dia_chi}</p>
          </div>
        ),
      },
      {
        key: "nguoi_quan_ly",
        label: "Quản lý",
        render: (value?: string | null) => value || "-",
      },
      {
        key: "so_lien_he",
        label: "Liên hệ",
        render: (value?: string | null) => value || "-",
      },
      {
        key: "nguon_lucs",
        label: "Kho",
        render: (value: AdminCenter["nguon_lucs"]) => (
          <Badge color="info" size="sm">
            {(value?.length || 0).toLocaleString()} mục
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: AdminCenter) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCenter(row)}
            startIcon={<ClipboardList className="h-4 w-4" />}
          >
            Chi tiết
          </Button>
        ),
      },
    ],
    [],
  );

  const detailResources = useMemo(() => {
    if (!selectedCenter) return [] as AdminResource[];
    return resources.filter((resource) => resource.id_trung_tam === selectedCenter.id);
  }, [resources, selectedCenter]);

  const detailLocation = useMemo(() => {
    if (!selectedCenter) return null;
    const { vi_do, kinh_do } = selectedCenter;
    if (vi_do === null || vi_do === undefined || kinh_do === null || kinh_do === undefined) {
      return null;
    }
    const lat = Number(vi_do);
    const lng = Number(kinh_do);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng } as Coordinates;
  }, [selectedCenter]);

  const handleInputChange = (key: keyof CenterForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateCenter = () => {
    if (!createForm.ten_trung_tam.trim()) {
      setCreateError("Vui lòng nhập tên trung tâm");
      showError("Vui lòng nhập tên trung tâm");
      return;
    }

    if (!createForm.dia_chi.trim()) {
      setCreateError("Vui lòng nhập địa chỉ trung tâm");
      showError("Vui lòng nhập địa chỉ trung tâm");
      return;
    }

    if (!createLocation) {
      setCreateError("Vui lòng chọn vị trí trung tâm trên bản đồ");
      showError("Vui lòng chọn vị trí trung tâm trên bản đồ");
      return;
    }

    setCreateError(null);

    createCenter.mutate(
      {
        ten_trung_tam: createForm.ten_trung_tam.trim(),
        dia_chi: createForm.dia_chi.trim(),
        nguoi_quan_ly: createForm.nguoi_quan_ly.trim() || undefined,
        so_lien_he: createForm.so_lien_he.trim() || undefined,
        vi_do: createLocation.lat,
        kinh_do: createLocation.lng,
      },
      {
        onSuccess: () => {
          setCreateForm(initialForm);
          setCreateLocation(null);
          setCreateError(null);
          setIsCreateModalOpen(false);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể tạo trung tâm.";
          setCreateError(message);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý trung tâm"
        description="Theo dõi thông tin và vị trí các trung tâm cứu trợ"
        showAddButton
        addButtonText="+ Thêm trung tâm"
        onAdd={() => {
          setCreateForm(initialForm);
          setCreateLocation(null);
          setCreateError(null);
          setIsCreateModalOpen(true);
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatsCard
          title="Tổng trung tâm"
          value={stats.total}
          icon={Building2}
          color="blue"
          description="Số trung tâm đang hoạt động"
        />
        <AdminStatsCard
          title="Có nguồn lực"
          value={stats.totalWithResources}
          icon={Warehouse}
          color="green"
          description="Trung tâm có kho vật tư"
        />
        <AdminStatsCard
          title="Nguồn lực quản lý"
          value={stats.resourcesCount}
          icon={Package}
          color="orange"
          description="Tổng số nguồn lực được phân bổ"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải danh sách trung tâm..."
          className="min-h-[320px]"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filteredCenters}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Tìm theo tên, địa chỉ, quản lý hoặc liên hệ..."
          onSearch={setSearchQuery}
          emptyMessage="Chưa có trung tâm nào"
          emptyDescription="Tạo trung tâm đầu tiên để bắt đầu quản lý mạng lưới cứu trợ."
          emptyIcon={<Building2 className="h-6 w-6" aria-hidden />}
          emptyAction={
            <Button startIcon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateModalOpen(true)}>
              Tạo trung tâm mới
            </Button>
          }
        />
      )}

      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm trung tâm mới"
        description="Nhập thông tin chi tiết và vị trí của trung tâm cứu trợ"
        size="lg"
        className="max-h-[90vh]"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateCenter} disabled={createCenter.isPending}>
              {createCenter.isPending ? "Đang tạo..." : "Thêm trung tâm"}
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
                Tên trung tâm
              </label>
              <Input
                value={createForm.ten_trung_tam}
                onChange={(e) => handleInputChange("ten_trung_tam", e.target.value)}
                placeholder="Ví dụ: Trung tâm cứu trợ TP. Hồ Chí Minh"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Địa chỉ
              </label>
              <Input
                value={createForm.dia_chi}
                onChange={(e) => handleInputChange("dia_chi", e.target.value)}
                placeholder="Nhập địa chỉ chi tiết"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Người quản lý
              </label>
              <Input
                value={createForm.nguoi_quan_ly}
                onChange={(e) => handleInputChange("nguoi_quan_ly", e.target.value)}
                placeholder="Tên người phụ trách"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Số liên hệ
              </label>
              <Input
                value={createForm.so_lien_he}
                onChange={(e) => handleInputChange("so_lien_he", e.target.value)}
                placeholder="Ví dụ: 090xxxxxxx"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vị trí trung tâm
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Nhấp vào bản đồ để chọn vị trí chính xác
                </span>
              </div>
              <MapLocationPicker
                value={createLocation}
                onChange={setCreateLocation}
                isActive={isCreateModalOpen}
                markerColor="#10B981"
                instructions="Nhấp vào bản đồ để đặt trung tâm"
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
                    onClick={() => setCreateLocation(null)}
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
        isOpen={Boolean(selectedCenter)}
        onClose={() => setSelectedCenter(null)}
        title={selectedCenter ? selectedCenter.ten_trung_tam : "Chi tiết trung tâm"}
        description={selectedCenter?.dia_chi}
        size="xl"
      >
        {selectedCenter ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="info" size="sm">
                {selectedCenter.nguon_lucs?.length || 0} nguồn lực
              </Badge>
              {selectedCenter.nguoi_quan_ly && (
                <Badge color="blue" size="sm">
                  Quản lý: {selectedCenter.nguoi_quan_ly}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thông tin liên hệ
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>
                        Người quản lý: {selectedCenter.nguoi_quan_ly || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span>
                        Liên hệ: {selectedCenter.so_lien_he || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-red-500" />
                      <span>{selectedCenter.dia_chi}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Vị trí trên bản đồ
                  </h3>
                  <div className="mt-4 space-y-3">
                    <MapLocationPicker
                      value={detailLocation}
                      onChange={() => {}}
                      isActive={Boolean(selectedCenter)}
                      interactive={false}
                      markerColor="#10B981"
                      instructions="Vị trí trung tâm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tọa độ sẽ hiển thị nếu trung tâm đã thiết lập vị trí khi tạo mới.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Nguồn lực thuộc trung tâm
                  </h3>
                  <div className="mt-4 space-y-3">
                    {detailResources.length > 0 ? (
                      detailResources.map((resource) => (
                        <div
                          key={resource.id}
                          className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 text-sm text-gray-700 dark:border-white/[0.04] dark:bg-white/[0.02] dark:text-gray-200"
                        >
                          <p className="font-medium">
                            {resource.ten_nguon_luc}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Loại: {resource.loai} • {resource.so_luong.toLocaleString()} {resource.don_vi}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Trung tâm chưa có nguồn lực nào được phân bổ.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={<Building2 className="h-6 w-6" aria-hidden />}
            title="Không có dữ liệu trung tâm"
            description="Chọn một trung tâm để xem chi tiết."
            variant="subtle"
            compact
          />
        )}
      </AdminModal>
    </div>
  );
}
