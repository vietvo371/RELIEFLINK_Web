"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "pink" | "indigo";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export default function AdminStatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  description,
}: AdminStatsCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    red: "text-red-600 bg-red-50 dark:bg-red-900/20",
    yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    pink: "text-pink-600 bg-pink-50 dark:bg-pink-900/20",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                so với tháng trước
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
