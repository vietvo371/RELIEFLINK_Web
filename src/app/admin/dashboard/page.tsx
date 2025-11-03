"use client";

import { useRequests } from "@/hooks/useRequests";
import { useResources } from "@/hooks/useResources";
import { useDistributions } from "@/hooks/useDistributions";
import { useCenters } from "@/hooks/useCenters";
import { useUsers } from "@/hooks/useUsers";
import { useAIPredictions } from "@/hooks/useAI";
import SummaryCards from "@/components/relief/SummaryCards";
import MapView from "@/components/relief/MapView";
import ReliefCard from "@/components/relief/ReliefCard";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import ReliefPriorityChart from "@/components/charts/ReliefPriorityChart";
import DistributionStatusChart from "@/components/charts/DistributionStatusChart";
import ResourceTypeChart from "@/components/charts/ResourceTypeChart";
import ChartTab from "@/components/common/ChartTab";
import Badge from "@/components/ui/badge/Badge";
import {
  translatePriority,
  translateRequestStatus,
  translateDistributionStatus,
  getPriorityColor,
  getDistributionStatusColor,
} from "@/lib/translations";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Users,
  Package,
  Truck,
  Brain
} from "lucide-react";

export default function DashboardPage() {
  const { data: requestsData, isLoading: requestsLoading } = useRequests();
  const { data: resourcesData, isLoading: resourcesLoading } = useResources();
  const { data: distributionsData, isLoading: distributionsLoading } = useDistributions();
  const { data: centersData, isLoading: centersLoading } = useCenters();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: aiData, isLoading: aiLoading } = useAIPredictions();

  if (requestsLoading || resourcesLoading || distributionsLoading || centersLoading || usersLoading) {
    return <AdminLoading variant="page" label="Đang tải dữ liệu tổng quan..." />;
  }

  const requests = requestsData?.requests || [];
  const resources = resourcesData?.resources || [];
  const distributions = distributionsData?.distributions || [];
  const centers = (centersData as any)?.centers || [];
  const users = usersData?.users || [];
  const predictions = aiData?.predictions || [];

  // Calculate comprehensive stats
  const stats = {
    total_requests: requests.length,
    total_resources: resources.length,
    total_distributions: distributions.length,
    urgent_requests: requests.filter((r: any) => r.do_uu_tien === "cao").length,
  };

  // Calculate additional metrics
  const completedDistributions = distributions.filter((d: any) => d.trang_thai === "hoan_thanh").length;
  const completionRate = distributions.length > 0 ? Math.round((completedDistributions / distributions.length) * 100) : 0;
  const activeVolunteers = users.filter((u: any) => u.vai_tro === "tinh_nguyen_vien").length;
  const totalCenters = centers.length;

  // Prepare map markers
  const mapMarkers = requests
    .filter((r: any) => r.vi_do && r.kinh_do)
    .map((r: any) => ({
      id: r.id,
      latitude: parseFloat(r.vi_do),
      longitude: parseFloat(r.kinh_do),
      title: r.loai_yeu_cau,
      type: "request" as const,
      priority: r.do_uu_tien,
      status: r.trang_thai,
      personCount: r.so_nguoi,
      description: r.mo_ta,
    }));

  // Generate chart data for requests by priority
  const priorityData = {
    categories: ["Thấp", "Trung bình", "Cao"],
    data: [
      requests.filter((r: any) => r.do_uu_tien === "thap").length,
      requests.filter((r: any) => r.do_uu_tien === "trung_binh").length,
      requests.filter((r: any) => r.do_uu_tien === "cao").length,
    ]
  };

  // Generate chart data for distributions by status
  const statusData = {
    categories: ["Chuẩn bị", "Vận chuyển", "Đang giao", "Hoàn thành"],
    data: [
      distributions.filter((d: any) => d.trang_thai === "dang_chuan_bi").length,
      distributions.filter((d: any) => d.trang_thai === "dang_van_chuyen").length,
      distributions.filter((d: any) => d.trang_thai === "dang_giao").length,
      distributions.filter((d: any) => d.trang_thai === "hoan_thanh").length,
    ]
  };

  // Generate chart data for resources by type
  const resourceTypes = [...new Set(resources.map((r: any) => r.loai))];
  const resourceData = {
    categories: resourceTypes,
    data: resourceTypes.map(type => 
      resources.filter((r: any) => r.loai === type).length
    )
  };

  // Recent activity data
  const recentRequests = requests.slice(0, 5);
  const recentDistributions = distributions.slice(0, 5);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Tổng quan hệ thống cứu trợ thảm họa"
      />

      {/* Summary cards */}
      <SummaryCards stats={stats} />

      {/* Additional metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Tỷ lệ hoàn thành"
          value={`${completionRate}%`}
          icon={CheckCircle}
          color="green"
          trend={{ value: 12, isPositive: true }}
          description="Tăng so với tháng trước"
        />

        <AdminStatsCard
          title="Tình nguyện viên"
          value={activeVolunteers}
          icon={Users}
          color="blue"
          trend={{ value: 8, isPositive: true }}
          description="Đang hoạt động"
        />

        <AdminStatsCard
          title="Trung tâm"
          value={totalCenters}
          icon={MapPin}
          color="purple"
          description="Trên toàn quốc"
        />

        <AdminStatsCard
          title="Dự báo AI"
          value={predictions.length}
          icon={Brain}
          color="orange"
          trend={{ value: 15, isPositive: true }}
          description="Dự báo mới"
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Priority Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Yêu cầu theo mức độ ưu tiên
            </h2>
            <ChartTab />
          </div>
          <ReliefPriorityChart data={priorityData} />
        </div>

        {/* Distribution Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Trạng thái phân phối
            </h2>
            <ChartTab />
          </div>
          <DistributionStatusChart data={statusData} />
        </div>
      </div>

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
            {recentRequests.map((request: any) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{request.loai_yeu_cau}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{request.so_nguoi} người</p>
                </div>
                <Badge 
                  color={getPriorityColor(request.do_uu_tien)}
                  size="sm"
                >
                  {translatePriority(request.do_uu_tien)}
                </Badge>
              </div>
            ))}
            {recentRequests.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Chưa có yêu cầu nào
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent distributions table */}
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
              {recentDistributions.map((dist: any) => (
                <tr
                  key={dist.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                    <Badge 
                      color={getDistributionStatusColor(dist.trang_thai)}
                      size="sm"
                    >
                      {translateDistributionStatus(dist.trang_thai)}
                    </Badge>
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
          {recentDistributions.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Chưa có phân phối nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
