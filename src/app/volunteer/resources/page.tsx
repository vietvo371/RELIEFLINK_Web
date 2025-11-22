"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useResources } from "@/hooks/useResources";
import {
  Package,
  Building2,
  MapPin,
  RefreshCcw,
  Search,
  Filter,
  Box,
} from "lucide-react";

type Resource = {
  id: number;
  ten_nguon_luc: string;
  loai: string;
  so_luong: number;
  don_vi: string;
  trang_thai?: string | null;
  trung_tam?: {
    id: number;
    ten_trung_tam?: string | null;
    dia_chi?: string | null;
    vi_do?: number | null;
    kinh_do?: number | null;
  } | null;
};

export default function VolunteerResourcesPage() {
  const { success: showSuccess } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch all resources
  const { data: resourcesData, isLoading, refetch } = useResources();

  // Filter resources
  const filteredResources = useMemo(() => {
    if (!resourcesData?.resources) return [];
    const resources = resourcesData.resources as Resource[];

    let filtered = resources;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.ten_nguon_luc?.toLowerCase().includes(query) ||
          r.loai?.toLowerCase().includes(query) ||
          r.trung_tam?.ten_trung_tam?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((r) => r.loai === typeFilter);
    }

    return filtered;
  }, [resourcesData, searchQuery, typeFilter]);

  // Get unique resource types
  const resourceTypes = useMemo(() => {
    if (!resourcesData?.resources) return [];
    const resources = resourcesData.resources as Resource[];
    const types = new Set(resources.map((r) => r.loai).filter(Boolean));
    return Array.from(types);
  }, [resourcesData]);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật danh sách nguồn lực");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách nguồn lực...</p>
        </div>
      </div>
    );
  }

  const resources = filteredResources as Resource[];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Nguồn lực
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Xem các nguồn lực có sẵn trong hệ thống
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, loại, trung tâm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          defaultValue={typeFilter}
          onChange={(value) => setTypeFilter(value)}
          options={[
            { value: "all", label: "Tất cả loại" },
            ...resourceTypes.map((type) => ({ value: type, label: type })),
          ]}
          className="w-full sm:w-48"
        />
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center">
            <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Không tìm thấy nguồn lực nào
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {searchQuery || typeFilter !== "all"
                ? "Thử thay đổi bộ lọc tìm kiếm"
                : "Hiện chưa có nguồn lực nào trong hệ thống"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {resource.ten_nguon_luc}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{resource.loai}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số lượng
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {resource.so_luong} {resource.don_vi}
                  </span>
                </div>

                {resource.trung_tam && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trung tâm
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {resource.trung_tam.ten_trung_tam}
                    </p>
                    {resource.trung_tam.dia_chi && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{resource.trung_tam.dia_chi}</span>
                      </p>
                    )}
                  </div>
                )}

                {resource.trang_thai && (
                  <Badge
                    color={resource.trang_thai === "san_sang" ? ("success" as any) : ("warning" as any)}
                    size="sm"
                  >
                    {resource.trang_thai === "san_sang" ? "Sẵn sàng" : resource.trang_thai}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

