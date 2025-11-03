"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Boxes,
  Filter,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminLoading from "@/components/admin/AdminLoading";
import Button from "@/components/ui/button/Button";
import { useRequests } from "@/hooks/useRequests";
import { useResources } from "@/hooks/useResources";
import { useDistributions } from "@/hooks/useDistributions";
import Badge from "@/components/ui/badge/Badge";
import {
  translatePriority,
  translateDistributionStatus,
  translateRequestStatus,
  getPriorityColor,
  getDistributionStatusColor,
} from "@/lib/translations";

interface RequestRow {
  id: number;
  loai_yeu_cau: string;
  do_uu_tien: string;
  so_nguoi: number;
  trang_thai: string;
  created_at: string;
}

interface ResourceRow {
  id: number;
  ten_nguon_luc: string;
  loai: string;
  so_luong: number;
  don_vi: string;
  trung_tam?: {
    ten_trung_tam: string;
  } | null;
}

interface DistributionRow {
  id: number;
  trang_thai: string;
  thoi_gian_xuat?: string | null;
  yeu_cau?: {
    loai_yeu_cau: string;
    do_uu_tien: string;
  } | null;
  nguon_luc?: {
    ten_nguon_luc: string;
    loai: string;
  } | null;
}

export default function AdminReportsPage() {
  const [requestPriorityFilter, setRequestPriorityFilter] = useState("all");
  const [distributionStatusFilter, setDistributionStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(" ");

  const {
    data: requestsData,
    isLoading: requestsLoading,
  } = useRequests();
  const {
    data: resourcesData,
    isLoading: resourcesLoading,
  } = useResources();
  const {
    data: distributionsData,
    isLoading: distributionsLoading,
  } = useDistributions();

  const requests = useMemo(
    () => ((requestsData?.requests || []) as RequestRow[]),
    [requestsData],
  );
  const resources = useMemo(
    () => ((resourcesData?.resources || []) as ResourceRow[]),
    [resourcesData],
  );
  const distributions = useMemo(
    () => ((distributionsData?.distributions || []) as DistributionRow[]),
    [distributionsData],
  );

  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const urgentRequests = requests.filter((req) => req.do_uu_tien === "cao").length;
    const completedDistributions = distributions.filter((dist) => dist.trang_thai === "hoan_thanh").length;
    const totalResources = resources.reduce((sum, res) => sum + res.so_luong, 0);

    return {
      totalRequests,
      urgentRequests,
      completedDistributions,
      totalResources,
    };
  }, [requests, distributions, resources]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((req) => {
      const matchesPriority = requestPriorityFilter === "all" || req.do_uu_tien === requestPriorityFilter;
      const matchesQuery =
        !query ||
        [req.loai_yeu_cau, translatePriority(req.do_uu_tien), translateRequestStatus(req.trang_thai)]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      return matchesPriority && matchesQuery;
    });
  }, [requests, requestPriorityFilter, searchQuery]);

  const filteredDistributions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return distributions.filter((dist) => {
      const matchesStatus =
        distributionStatusFilter === "all" || dist.trang_thai === distributionStatusFilter;
      const matchesQuery =
        !query ||
        [dist.yeu_cau?.loai_yeu_cau, dist.nguon_luc?.ten_nguon_luc, translateDistributionStatus(dist.trang_thai)]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [distributions, distributionStatusFilter, searchQuery]);

  const requestColumns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (value: number) => `#${value}`,
      },
      {
        key: "loai_yeu_cau",
        label: "Loại yêu cầu",
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
        key: "so_nguoi",
        label: "Ảnh hưởng",
        render: (value: number) => `${value} người`,
      },
      {
        key: "trang_thai",
        label: "Trạng thái",
        render: (value: string) => translateRequestStatus(value),
      },
      {
        key: "created_at",
        label: "Ngày tạo",
        render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
      },
    ],
    [],
  );

  const distributionColumns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (value: number) => `#${value}`,
      },
      {
        key: "yeu_cau",
        label: "Yêu cầu",
        render: (_: unknown, row: DistributionRow) => row.yeu_cau?.loai_yeu_cau || "-",
      },
      {
        key: "nguon_luc",
        label: "Nguồn lực",
        render: (_: unknown, row: DistributionRow) => row.nguon_luc?.ten_nguon_luc || "-",
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
        key: "thoi_gian_xuat",
        label: "Xuất kho",
        render: (value?: string | null) => (value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "-")
      },
    ],
    [],
  );

  const resourceColumns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (value: number) => `#${value}`,
      },
      {
        key: "ten_nguon_luc",
        label: "Nguồn lực",
      },
      {
        key: "loai",
        label: "Loại",
        render: (value: string) => (
          <Badge color="info" size="sm">
            {value}
          </Badge>
        ),
      },
      {
        key: "so_luong",
        label: "Số lượng",
        render: (value: number, row: ResourceRow) => `${value.toLocaleString()} ${row.don_vi}`,
      },
      {
        key: "trung_tam",
        label: "Trung tâm",
        render: (_: unknown, row: ResourceRow) => row.trung_tam?.ten_trung_tam || "-",
      },
    ],
    [],
  );

  const isLoadingAny = requestsLoading || resourcesLoading || distributionsLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Báo cáo & Thống kê"
        description="Tổng hợp số liệu về yêu cầu, nguồn lực và phân phối"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatsCard
          title="Tổng yêu cầu"
          value={stats.totalRequests}
          icon={AlertTriangle}
          color="red"
          description="Số yêu cầu đã ghi nhận"
        />
        <AdminStatsCard
          title="Khẩn cấp"
          value={stats.urgentRequests}
          icon={Activity}
          color="orange"
          description="Yêu cầu ưu tiên cao"
        />
        <AdminStatsCard
          title="Phân phối hoàn thành"
          value={stats.completedDistributions}
          icon={TrendingUp}
          color="green"
          description="Đã giao tới điểm nhận"
        />
        <AdminStatsCard
          title="Tồn kho"
          value={stats.totalResources}
          icon={Boxes}
          color="blue"
          description="Tổng số đơn vị nguồn lực"
        />
      </div>

      {isLoadingAny ? (
        <AdminLoading
          variant="section"
          label="Đang tổng hợp dữ liệu báo cáo..."
          className="min-h-[320px]"
        />
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Yêu cầu cứu trợ
              </h2>
              <Button
                size="sm"
                variant="outline"
                startIcon={<Filter className="h-4 w-4" />}
                onClick={() => setRequestPriorityFilter("all")}
              >
                Xóa lọc
              </Button>
            </div>

            <AdminDataTable
              columns={requestColumns}
              data={filteredRequests}
              searchable
              searchPlaceholder="Tìm theo loại yêu cầu, ưu tiên..."
              onSearch={setSearchQuery}
              filters={[
                {
                  key: "priority",
                  label: "Ưu tiên",
                  options: [
                    { value: "all", label: "Tất cả ưu tiên" },
                    { value: "cao", label: translatePriority("cao") },
                    { value: "trung_binh", label: translatePriority("trung_binh") },
                    { value: "thap", label: translatePriority("thap") },
                  ],
                  onChange: setRequestPriorityFilter,
                },
              ]}
              emptyMessage="Không có yêu cầu"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nguồn lực trong kho
            </h2>
            <AdminDataTable
              columns={resourceColumns}
              data={resources}
              searchable
              searchPlaceholder="Tìm theo tên nguồn lực hoặc trung tâm..."
              onSearch={setSearchQuery}
              emptyMessage="Không có nguồn lực"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Phân phối gần đây
              </h2>
              <Button
                size="sm"
                variant="outline"
                startIcon={<RefreshCcw className="h-4 w-4" />}
                onClick={() => setDistributionStatusFilter("all")}
              >
                Xóa lọc
              </Button>
            </div>
            <AdminDataTable
              columns={distributionColumns}
              data={filteredDistributions}
              searchable
              searchPlaceholder="Tìm theo yêu cầu, nguồn lực..."
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
                  onChange: setDistributionStatusFilter,
                },
              ]}
              emptyMessage="Không có phân phối"
            />
          </section>
        </div>
      )}
    </div>
  );
}
