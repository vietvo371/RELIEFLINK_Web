"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Settings, Key, Database, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const settingsSections = [
    {
      title: "API Keys",
      description: "Quản lý các API keys cho tích hợp bên ngoài",
      icon: Key,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "AI Integration",
      description: "Cấu hình tích hợp AI và machine learning",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Blockchain",
      description: "Cài đặt kết nối blockchain và smart contracts",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Database",
      description: "Backup và quản lý cơ sở dữ liệu",
      icon: Database,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cấu hình hệ thống"
        description="API keys, tích hợp AI/Blockchain, backup data"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`${section.bgColor} p-3 rounded-lg`}>
                <section.icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {section.description}
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Cấu hình →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Thông tin hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Phiên bản</p>
            <p className="font-medium">v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Trạng thái</p>
            <p className="font-medium text-green-600">Hoạt động bình thường</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Cập nhật cuối</p>
            <p className="font-medium">Hôm nay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
