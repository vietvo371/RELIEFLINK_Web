"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Cpu,
  Hash,
  History,
  RefreshCcw,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { useBlockchainLogs } from "@/hooks/useBlockchain";
import { translateDistributionStatus, translatePriority } from "@/lib/translations";

type BlockchainLog = {
  id: number;
  ma_giao_dich: string;
  hanh_dong: string;
  thoi_gian: string;
  du_lieu: Record<string, unknown>;
  phan_phoi: {
    id: number;
    trang_thai: string;
    yeu_cau?: {
      loai_yeu_cau: string;
      do_uu_tien: string;
    } | null;
    nguon_luc?: {
      ten_nguon_luc: string;
      loai: string;
    } | null;
    tinh_nguyen_vien?: {
      ho_va_ten: string;
      email: string;
    } | null;
  } | null;
};

const actionLabels: Record<string, string> = {
  phan_phoi_tao_moi: "Tạo mới",
  phan_phoi_bat_dau: "Bắt đầu",
  phan_phoi_dang_giao: "Đang giao",
  phan_phoi_hoan_thanh: "Hoàn thành",
  phan_phoi_huy_bo: "Hủy bỏ",
  phan_phoi_cap_nhat: "Cập nhật",
  phan_phoi_xac_nhan: "Xác nhận",
  phan_phoi_thanh_toan: "Thanh toán",
};

export default function AdminBlockchainPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<BlockchainLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, refetch } = useBlockchainLogs();
  const logs = useMemo(() => (data?.logs || []) as BlockchainLog[], [data]);

  const actionOptions = useMemo(
    () =>
      Array.from(new Set(logs.map((log) => log.hanh_dong)))
        .filter(Boolean)
        .map((action) => ({
          value: action,
          label: actionLabels[action] || action,
        })),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesAction = actionFilter === "all" || log.hanh_dong === actionFilter;
      const matchesQuery =
        !query ||
        [log.ma_giao_dich, log.hanh_dong, log.phan_phoi?.id, log.phan_phoi?.yeu_cau?.loai_yeu_cau]
          .filter(Boolean)
          .some((value) => value!.toString().toLowerCase().includes(query));
      return matchesAction && matchesQuery;
    });
  }, [logs, actionFilter, searchQuery]);

  // Paginate logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, searchQuery]);

  // Ensure page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = logs.length;
    const last24Hours = logs.filter((log) => {
      const logTime = new Date(log.thoi_gian).getTime();
      return Date.now() - logTime < 24 * 60 * 60 * 1000;
    }).length;
    const uniqueTx = new Set(logs.map((log) => log.ma_giao_dich)).size;
    const completion = logs.filter((log) => log.hanh_dong === "phan_phoi_hoan_thanh").length;
    return {
      total,
      last24Hours,
      uniqueTx,
      completion,
    };
  }, [logs]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (value: number) => `#${value}`,
      },
      {
        key: "ma_giao_dich",
        label: "Hash",
        render: (value: string) => (
          <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
            {value}
          </code>
        ),
      },
      {
        key: "hanh_dong",
        label: "Hành động",
        render: (value: string) => actionLabels[value] || value,
      },
      {
        key: "phan_phoi",
        label: "Phân phối",
        render: (_: unknown, row: BlockchainLog) => (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.phan_phoi ? `PP #${row.phan_phoi.id}` : "-"}
            </p>
            {row.phan_phoi?.yeu_cau && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.phan_phoi.yeu_cau.loai_yeu_cau}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "thoi_gian",
        label: "Thời gian",
        render: (value: string) => format(new Date(value), "dd/MM/yyyy HH:mm"),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: BlockchainLog) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedLog(row)}>
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
        title="Nhật ký Blockchain"
        description="Theo dõi giao dịch on-chain xác thực chuỗi phân phối"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatsCard
          title="Tổng bản ghi"
          value={stats.total}
          icon={History}
          color="blue"
          description="Logs được đồng bộ"
        />
        <AdminStatsCard
          title="24h qua"
          value={stats.last24Hours}
          icon={RefreshCcw}
          color="green"
          description="Giao dịch trong 24h"
        />
        <AdminStatsCard
          title="TX duy nhất"
          value={stats.uniqueTx}
          icon={Hash}
          color="orange"
          description="Số hash khác nhau"
        />
        <AdminStatsCard
          title="Hoàn thành"
          value={stats.completion}
          icon={Truck}
          color="purple"
          description="Đã giao thành công"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải nhật ký blockchain..."
          className="min-h-[320px]"
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nhật ký giao dịch ({filteredLogs.length})
            </h2>
          </div>
          <AdminDataTable
            columns={columns}
            data={paginatedLogs}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Tìm theo hash, hành động hoặc phân phối..."
            onSearch={setSearchQuery}
            filters={[
              {
                key: "action",
                label: "Hành động",
                options: [
                  { value: "all", label: "Tất cả" },
                  ...actionOptions,
                ],
                onChange: setActionFilter,
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
            emptyMessage="Chưa có log blockchain"
            emptyDescription="Các giao dịch sẽ hiển thị sau khi có phân phối được xác thực."
            emptyIcon={<Cpu className="h-6 w-6" aria-hidden />}
          />

          {/* Pagination */}
          {filteredLogs.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} / {filteredLogs.length} bản ghi
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  startIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  endIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AdminModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `Log #${selectedLog.id}` : "Chi tiết nhật ký"}
        description={selectedLog?.ma_giao_dich}
        size="lg"
        className="max-h-[80vh]"
      >
        {selectedLog ? (
          <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="info" size="sm">
                {actionLabels[selectedLog.hanh_dong] || selectedLog.hanh_dong}
              </Badge>
              <Badge color="light" size="sm">
                {format(new Date(selectedLog.thoi_gian), "dd/MM/yyyy HH:mm:ss")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thông tin phân phối
                </h3>
                <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                  <p>
                    <span className="font-medium">Mã phân phối:</span>{" "}
                    {selectedLog.phan_phoi ? `PP #${selectedLog.phan_phoi.id}` : "-"}
                  </p>
                  {selectedLog.phan_phoi?.yeu_cau && (
                    <p>
                      <span className="font-medium">Yêu cầu:</span>{" "}
                      {selectedLog.phan_phoi.yeu_cau.loai_yeu_cau} • Ưu tiên {translatePriority(selectedLog.phan_phoi.yeu_cau.do_uu_tien)}
                    </p>
                  )}
                  {selectedLog.phan_phoi?.nguon_luc && (
                    <p>
                      <span className="font-medium">Nguồn lực:</span>{" "}
                      {selectedLog.phan_phoi.nguon_luc.ten_nguon_luc} ({selectedLog.phan_phoi.nguon_luc.loai})
                    </p>
                  )}
                  {selectedLog.phan_phoi?.tinh_nguyen_vien && (
                    <p>
                      <span className="font-medium">Tình nguyện viên:</span>{" "}
                      {selectedLog.phan_phoi.tinh_nguyen_vien.ho_va_ten} ({selectedLog.phan_phoi.tinh_nguyen_vien.email})
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Trạng thái hiện tại:</span>{" "}
                    {translateDistributionStatus(selectedLog.phan_phoi?.trang_thai || "")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payload giao dịch
                </h3>
                <pre className="mt-4 max-h-60 overflow-auto rounded-lg bg-gray-900/90 p-4 text-xs text-green-200">
{JSON.stringify(selectedLog.du_lieu, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={<Cpu className="h-6 w-6" aria-hidden />}
            title="Không có dữ liệu"
            description="Chọn một log để xem chi tiết giao dịch."
            variant="subtle"
            compact
          />
        )}
      </AdminModal>
    </div>
  );
}
