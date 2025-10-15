"use client";

import { useRequests } from "@/hooks/useRequests";
import { useResources } from "@/hooks/useResources";
import { useDistributions } from "@/hooks/useDistributions";
import SummaryCards from "@/components/relief/SummaryCards";
import MapView from "@/components/relief/MapView";
import ReliefCard from "@/components/relief/ReliefCard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: requestsData, isLoading: requestsLoading } = useRequests();
  const { data: resourcesData, isLoading: resourcesLoading } = useResources();
  const { data: distributionsData, isLoading: distributionsLoading } =
    useDistributions();

  if (requestsLoading || resourcesLoading || distributionsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const requests = requestsData?.requests || [];
  const resources = resourcesData?.resources || [];
  const distributions = distributionsData?.distributions || [];

  const stats = {
    total_requests: requests.length,
    total_resources: resources.length,
    total_distributions: distributions.length,
    urgent_requests: requests.filter(
      (r: any) => r.do_uu_tien === "cao",
    ).length,
  };

  // Prepare map markers
  const mapMarkers = requests
    .filter((r: any) => r.vi_do && r.kinh_do)
    .map((r: any) => ({
      id: r.id,
      latitude: parseFloat(r.vi_do),
      longitude: parseFloat(r.kinh_do),
      title: r.loai_yeu_cau,
      type: "request" as const,
    }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tổng quan hệ thống cứu trợ thảm họa
        </p>
      </div>

      {/* Summary cards */}
      <SummaryCards stats={stats} />

      {/* Map and recent requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Bản đồ yêu cầu cứu trợ
          </h2>
          <div className="h-[400px]">
            <MapView markers={mapMarkers} />
          </div>
        </div>

        {/* Recent requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Yêu cầu gần đây
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {requests.slice(0, 3).map((request: any) => (
              <ReliefCard key={request.id} request={request} />
            ))}
            {requests.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Chưa có yêu cầu nào
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent distributions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Phân phối gần đây
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Nguồn lực
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Tình nguyện viên
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  TX Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {distributions.slice(0, 5).map((dist: any) => (
                <tr
                  key={dist.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                    #{dist.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {dist.nguon_luc?.ten_nguon_luc || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {dist.tinh_nguyen_vien?.ho_va_ten || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full">
                      {dist.trang_thai}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {dist.ma_giao_dich
                      ? `${dist.ma_giao_dich.slice(0, 10)}...`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {distributions.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Chưa có phân phối nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

