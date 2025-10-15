"use client";

import { useResources } from "@/hooks/useResources";
import { Package, Loader2 } from "lucide-react";

export default function ResourcesPage() {
  const { data, isLoading } = useResources();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const resources = data?.resources || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nguồn lực
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quản lý nguồn lực cứu trợ từ các trung tâm
        </p>
      </div>

      {/* Resources table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Tên nguồn lực
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Loại
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Số lượng
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Đơn vị
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Trung tâm
                </th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource: any, index: number) => (
                <tr
                  key={resource.id}
                  className={`border-b border-gray-100 dark:border-gray-700 ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    #{resource.id}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {resource.ten_nguon_luc}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full">
                      {resource.loai}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                    {resource.so_luong.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    {resource.don_vi}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    {resource.trung_tam?.ten_trung_tam || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resources.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Không có nguồn lực nào
            </p>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Tổng số nguồn lực
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {resources.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Loại nguồn lực
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {new Set(resources.map((r: any) => r.loai)).size}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Trung tâm cứu trợ
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {new Set(resources.map((r: any) => r.id_trung_tam)).size}
          </p>
        </div>
      </div>
    </div>
  );
}

