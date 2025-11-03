"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Brain,
  RefreshCcw,
  Earth,
  Flame,
  Droplets,
  Stethoscope,
  Home,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import PredictionChart from "@/components/relief/PredictionChart";
import { useAIPredictions, AIPrediction } from "@/hooks/useAIPredictions";

type PredictionsResponse = {
  predictions: AIPrediction[];
};

const disasterLabels: Record<string, string> = {
  "Lũ lụt": "Lũ lụt",
  "Bão": "Bão",
  "Hạn hán": "Hạn hán",
  "Sạt lở đất": "Sạt lở đất",
  "Động đất": "Động đất",
  "Cháy rừng": "Cháy rừng",
};

export default function AdminAIPage() {
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [generateMock, setGenerateMock] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<AIPrediction | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading, refetch } = useAIPredictions(
    selectedProvince !== "all" ? selectedProvince : undefined,
    generateMock,
  );

  const predictions = useMemo(
    () => {
      if (!data) return [];
      return ((data as unknown as PredictionsResponse)?.predictions || []) as AIPrediction[];
    },
    [data],
  );

  const filteredPredictions = useMemo(() => {
    if (!searchQuery.trim()) {
      return predictions;
    }
    const query = searchQuery.toLowerCase();
    return predictions.filter(
      (prediction) =>
        prediction.tinh_thanh.toLowerCase().includes(query) ||
        prediction.loai_thien_tai.toLowerCase().includes(query) ||
        (disasterLabels[prediction.loai_thien_tai] || "").toLowerCase().includes(query)
    );
  }, [predictions, searchQuery]);

  const provinceOptions = useMemo(() => {
    const uniqueProvinces = Array.from(new Set(predictions.map((item) => item.tinh_thanh)));
    return uniqueProvinces.map((province) => ({ value: province, label: province }));
  }, [predictions]);

  // Nhóm dữ liệu theo tỉnh thành cho biểu đồ line (tổng hợp các giá trị)
  const provinceGroupedData = useMemo(() => {
    const grouped = predictions.reduce((acc, prediction) => {
      const province = prediction.tinh_thanh;
      if (!acc[province]) {
        acc[province] = {
          id: 0,
          tinh_thanh: province,
          loai_thien_tai: "",
          du_doan_nhu_cau_thuc_pham: 0,
          du_doan_nhu_cau_nuoc: 0,
          du_doan_nhu_cau_thuoc: 0,
          du_doan_nhu_cau_cho_o: 0,
          ngay_du_bao: prediction.ngay_du_bao,
        };
      }
      acc[province].du_doan_nhu_cau_thuc_pham += prediction.du_doan_nhu_cau_thuc_pham;
      acc[province].du_doan_nhu_cau_nuoc += prediction.du_doan_nhu_cau_nuoc;
      acc[province].du_doan_nhu_cau_thuoc += prediction.du_doan_nhu_cau_thuoc;
      acc[province].du_doan_nhu_cau_cho_o += prediction.du_doan_nhu_cau_cho_o;
      return acc;
    }, {} as Record<string, AIPrediction>);

    return Object.values(grouped).sort((a, b) => 
      a.tinh_thanh.localeCompare(b.tinh_thanh)
    );
  }, [predictions]);

  const stats = useMemo(() => {
    if (predictions.length === 0) {
      return {
        total: 0,
        topFood: 0,
        topWater: 0,
        topShelter: 0,
      };
    }

    const topFood = Math.max(...predictions.map((item) => item.du_doan_nhu_cau_thuc_pham));
    const topWater = Math.max(...predictions.map((item) => item.du_doan_nhu_cau_nuoc));
    const topShelter = Math.max(...predictions.map((item) => item.du_doan_nhu_cau_cho_o));

    return {
      total: predictions.length,
      topFood,
      topWater,
      topShelter,
    };
  }, [predictions]);

  const columns = useMemo(
    () => [
      {
        key: "tinh_thanh",
        label: "Tỉnh thành",
      },
      {
        key: "loai_thien_tai",
        label: "Thiên tai",
        render: (value: string) => disasterLabels[value] || value,
      },
      {
        key: "du_doan_nhu_cau_thuc_pham",
        label: "Thực phẩm",
        render: (value: number) => value.toLocaleString(),
      },
      {
        key: "du_doan_nhu_cau_nuoc",
        label: "Nước",
        render: (value: number) => value.toLocaleString(),
      },
      {
        key: "du_doan_nhu_cau_thuoc",
        label: "Thuốc",
        render: (value: number) => value.toLocaleString(),
      },
      {
        key: "du_doan_nhu_cau_cho_o",
        label: "Chỗ ở",
        render: (value: number) => value.toLocaleString(),
      },
      {
        key: "ngay_du_bao",
        label: "Ngày dự báo",
        render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: AIPrediction) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedPrediction(row)}>
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
        title="Dự báo AI"
        description="Phân tích và dự đoán nhu cầu cứu trợ theo khu vực"
        actions={[
          {
            label: generateMock ? "Đang hiển thị dữ liệu giả lập" : "Hiển thị dữ liệu giả lập",
            variant: "outline",
            onClick: () => setGenerateMock((prev) => !prev),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatsCard
          title="Tổng dự báo"
          value={stats.total}
          icon={Brain}
          color="blue"
          description="Bản ghi dự báo đang theo dõi"
        />
        <AdminStatsCard
          title="Nhu cầu thực phẩm"
          value={stats.topFood}
          icon={Flame}
          color="red"
          description="Nhu cầu cao nhất (kg)"
        />
        <AdminStatsCard
          title="Nhu cầu nước"
          value={stats.topWater}
          icon={Droplets}
          color="blue"
          description="Nhu cầu cao nhất (lít)"
        />
        <AdminStatsCard
          title="Nhu cầu chỗ ở"
          value={stats.topShelter}
          icon={Home}
          color="orange"
          description="Số hộ cần hỗ trợ chỗ ở"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải dự báo AI..."
          className="min-h-[320px]"
        />
      ) : predictions.length === 0 ? (
        <AdminEmptyState
          icon={<Earth className="h-6 w-6" aria-hidden />}
          title="Chưa có dữ liệu dự báo"
          description="Hãy chạy mô hình AI hoặc bật chế độ giả lập để xem thử."
          action={
            <Button onClick={() => setGenerateMock(true)} startIcon={<RefreshCcw className="h-4 w-4" />}>
              Hiển thị dữ liệu giả lập
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Filters và Controls */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lọc theo tỉnh thành:
                </label>
                <div className="w-full sm:w-64">
                  <Select
                    options={[{ value: "all", label: "Tất cả tỉnh thành" }, ...provinceOptions]}
                    placeholder="Chọn tỉnh thành"
                    onChange={(value) => setSelectedProvince(value)}
                    defaultValue={selectedProvince}
                  />
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                startIcon={<RefreshCcw className="h-4 w-4" />}
              >
                Tải lại dữ liệu
              </Button>
            </div>
          </section>

          {/* Biểu đồ */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nhu cầu tổng hợp
                </h2>
              </div>
              <div className="h-80">
                <PredictionChart data={predictions.slice(0, 10)} type="bar" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dự báo theo tỉnh thành
                </h2>
              </div>
              <div className="h-80">
                {provinceGroupedData.length > 0 ? (
                  <PredictionChart data={provinceGroupedData} type="line" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    Không có dữ liệu để hiển thị
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Bảng dữ liệu */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bảng dữ liệu dự báo
              </h2>
            </div>
            <AdminDataTable
              columns={columns}
              data={filteredPredictions}
              searchable
              searchPlaceholder="Tìm theo tỉnh thành hoặc loại thiên tai..."
              onSearch={setSearchQuery}
              emptyMessage="Không có dữ liệu dự báo"
            />
          </section>
        </div>
      )}

      <AdminModal
        isOpen={Boolean(selectedPrediction)}
        onClose={() => setSelectedPrediction(null)}
        title={selectedPrediction ? `${selectedPrediction.tinh_thanh} - ${disasterLabels[selectedPrediction.loai_thien_tai] || selectedPrediction.loai_thien_tai}` : "Chi tiết dự báo"}
        description={selectedPrediction ? `Ngày dự báo: ${format(new Date(selectedPrediction.ngay_du_bao), "dd/MM/yyyy")}` : undefined}
        size="md"
        className="max-h-[80vh]"
      >
        {selectedPrediction ? (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
            <div className="space-y-1">
              <p className="font-medium">Tỉnh thành</p>
              <p>{selectedPrediction.tinh_thanh}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MetricCard icon={Flame} label="Thực phẩm" value={selectedPrediction.du_doan_nhu_cau_thuc_pham} suffix="kg" />
              <MetricCard icon={Droplets} label="Nước" value={selectedPrediction.du_doan_nhu_cau_nuoc} suffix="lít" />
              <MetricCard icon={Stethoscope} label="Thuốc" value={selectedPrediction.du_doan_nhu_cau_thuoc} suffix="đơn vị" />
              <MetricCard icon={Home} label="Chỗ ở" value={selectedPrediction.du_doan_nhu_cau_cho_o} suffix="hộ" />
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={<Brain className="h-6 w-6" aria-hidden />}
            title="Không có dữ liệu"
            description="Chọn một bản ghi từ bảng để xem chi tiết."
            variant="subtle"
            compact
          />
        )}
      </AdminModal>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.08] dark:bg-gray-900/60">
      <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {value.toLocaleString()} {suffix}
        </p>
      </div>
    </div>
  );
}
