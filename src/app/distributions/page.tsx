"use client";

import { useDistributions } from "@/hooks/useDistributions";
import { useBlockchainLogs } from "@/hooks/useBlockchain";
import { Loader2, Truck } from "lucide-react";
import BlockchainTimeline from "@/components/relief/BlockchainTimeline";

export default function DistributionsPage() {
  const { data: distributionsData, isLoading: distributionsLoading } = useDistributions();
  const { data: logsData, isLoading: logsLoading } = useBlockchainLogs();

  if (distributionsLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const distributions = distributionsData?.distributions || [];
  const logs = logsData?.logs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Phân phối cứu trợ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Theo dõi phân phối và nhật ký blockchain
        </p>
      </div>

      {/* Distributions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {distributions.map((dist: any) => (
          <div
            key={dist.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mr-3">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Phân phối #{dist.id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dist.tinh_nguyen_vien?.ho_va_ten || "N/A"}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full">
                {dist.trang_thai}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Nguồn lực:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dist.nguon_luc?.ten_nguon_luc || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Trung tâm:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dist.nguon_luc?.trung_tam?.ten_trung_tam || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Người nhận:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dist.yeu_cau?.nguoi_dung?.ho_va_ten || "N/A"}
                </span>
              </div>
            </div>

            {dist.ma_giao_dich && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Blockchain TX Hash:
                </p>
                <p className="text-sm font-mono text-green-600 dark:text-green-400 break-all">
                  {dist.ma_giao_dich}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {distributions.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có phân phối nào
          </p>
        </div>
      )}

      {/* Blockchain timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Nhật ký Blockchain
        </h2>
        {logs.length > 0 ? (
          <BlockchainTimeline logs={logs} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Chưa có nhật ký nào
          </p>
        )}
      </div>
    </div>
  );
}

