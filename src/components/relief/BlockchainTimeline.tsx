"use client";

import { CheckCircle, Package, Truck } from "lucide-react";
import { format } from "date-fns";

interface BlockchainTimelineProps {
  logs: Array<{
    id: number;
    ma_giao_dich: string;
    hanh_dong: string;
    thoi_gian: string;
    du_lieu: any;
  }>;
}

export default function BlockchainTimeline({ logs }: BlockchainTimelineProps) {
  const getActionIcon = (action: string) => {
    if (action.includes("tao")) return <Package className="w-5 h-5" />;
    if (action.includes("giao")) return <Truck className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getActionText = (action: string) => {
    if (action === "phan_phoi_tao_moi") return "Tạo phân phối mới";
    if (action === "phan_phoi_cap_nhat") return "Cập nhật phân phối";
    if (action === "phan_phoi_hoan_thanh") return "Hoàn thành phân phối";
    return action;
  };

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center">
              {getActionIcon(log.hanh_dong)}
            </div>
            {index < logs.length - 1 && (
              <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getActionText(log.hanh_dong)}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(log.thoi_gian), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-mono break-all">
                TX: {log.ma_giao_dich.slice(0, 20)}...
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.du_lieu, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

