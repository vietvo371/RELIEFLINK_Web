"use client";

import { useRequests } from "@/hooks/useRequests";
import { useResources } from "@/hooks/useResources";
import { useDistributions } from "@/hooks/useDistributions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SummaryCards from "@/components/relief/SummaryCards";
import AdminLoading from "@/components/admin/AdminLoading";

export default function AdminReportsPage() {
  const { data: req, isLoading: requestsLoading } = useRequests();
  const { data: res, isLoading: resourcesLoading } = useResources();
  const { data: dist, isLoading: distributionsLoading } = useDistributions();

  const requests = req?.requests || [];
  const resources = res?.resources || [];
  const dists = dist?.distributions || [];

  const completed = dists.filter((d: any) => d.trang_thai === "da_giao").length;
  const completionRate = requests.length ? Math.round((completed / requests.length) * 100) : 0;

  const stats = {
    total_requests: requests.length,
    total_resources: resources.length,
    total_distributions: dists.length,
    urgent_requests: requests.filter((r: any) => r.do_uu_tien === "cao").length,
  };

  const isLoading = requestsLoading || resourcesLoading || distributionsLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Báo cáo & Thống kê"
        description="Tổng hợp số liệu hệ thống"
      />

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tổng hợp báo cáo..."
          className="min-h-[320px]"
        />
      ) : (
        <>
          <SummaryCards stats={stats} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tỷ lệ hoàn thành</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{completionRate}%</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
              <p className="text-sm text-gray-500 dark:text-gray-400">Yêu cầu khẩn cấp</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats.urgent_requests}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng nguồn lực</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{stats.total_resources}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
