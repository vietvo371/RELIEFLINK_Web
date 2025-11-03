"use client";

import { Loader2 } from "lucide-react";
import React from "react";

type AdminLoadingVariant = "page" | "section" | "inline";

interface AdminLoadingProps {
  label?: string;
  variant?: AdminLoadingVariant;
  className?: string;
}

const variantToContainer: Record<AdminLoadingVariant, string> = {
  page: "flex flex-col items-center justify-center gap-3 py-24",
  section: "flex flex-col items-center justify-center gap-3 py-12",
  inline: "inline-flex items-center gap-2",
};

const variantToSpinner: Record<AdminLoadingVariant, string> = {
  page: "h-10 w-10",
  section: "h-8 w-8",
  inline: "h-5 w-5",
};

const variantToLabel: Record<AdminLoadingVariant, string> = {
  page: "text-base font-medium",
  section: "text-sm font-medium",
  inline: "text-sm",
};

export default function AdminLoading({
  label = "Đang tải dữ liệu...",
  variant = "section",
  className = "",
}: AdminLoadingProps) {
  const containerClasses = `${variantToContainer[variant]} ${className}`.trim();
  const spinnerClasses = `${variantToSpinner[variant]} text-brand-500 animate-spin`;
  const labelClasses = `${variantToLabel[variant]} text-gray-600 dark:text-gray-300`;

  return (
    <div className={containerClasses}>
      <Loader2 aria-hidden className={spinnerClasses} />
      {label && <p className={labelClasses}>{label}</p>}
    </div>
  );
}
