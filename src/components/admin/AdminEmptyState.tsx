"use client";

import React from "react";
import { Inbox } from "lucide-react";

type AdminEmptyStateVariant = "card" | "subtle";

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: AdminEmptyStateVariant;
  compact?: boolean;
  className?: string;
}

export default function AdminEmptyState({
  icon,
  title = "Không có dữ liệu",
  description,
  action,
  variant = "card",
  compact = false,
  className = "",
}: AdminEmptyStateProps) {
  const baseClasses =
    "flex flex-col items-center justify-center text-center gap-3 rounded-2xl transition-colors";
  const padding = compact ? "py-6 px-6" : "py-12 px-8";
  const variantClasses =
    variant === "card"
      ? "bg-white dark:bg-gray-900/70 border border-gray-200 shadow-sm dark:border-white/[0.08]"
      : "border-2 border-dashed border-gray-200 dark:border-white/[0.08] bg-transparent";

  const Icon = icon;

  return (
    <div className={`${baseClasses} ${padding} ${variantClasses} ${className}`.trim()}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
        {Icon ? (
          Icon
        ) : (
          <Inbox className="h-6 w-6" aria-hidden />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
