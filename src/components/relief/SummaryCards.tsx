"use client";

import { FileText, Package, Truck, AlertCircle } from "lucide-react";

interface SummaryCardsProps {
  stats: {
    total_requests: number;
    total_resources: number;
    total_distributions: number;
    urgent_requests: number;
  };
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    {
      title: "Yêu cầu cứu trợ",
      value: stats.total_requests,
      icon: FileText,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Nguồn lực",
      value: stats.total_resources,
      icon: Package,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Phân phối",
      value: stats.total_distributions,
      icon: Truck,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Khẩn cấp",
      value: stats.urgent_requests,
      icon: AlertCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </div>
            <div className={`${card.bgColor} p-4 rounded-lg`}>
              <card.icon className={`w-8 h-8 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

