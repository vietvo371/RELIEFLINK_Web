"use client";

import Button from "@/components/ui/button/Button";
import { Plus, Download, Filter } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "outline";
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
  showAddButton?: boolean;
  onAdd?: () => void;
  addButtonText?: string;
}

export default function AdminPageHeader({
  title,
  description,
  actions = [],
  showAddButton = false,
  onAdd,
  addButtonText = "Thêm mới",
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            onClick={action.onClick}
            disabled={action.disabled}
            startIcon={action.icon}
          >
            {action.label}
          </Button>
        ))}
        
        {showAddButton && onAdd && (
          <Button
            onClick={onAdd}
            startIcon={<Plus className="w-4 h-4" />}
          >
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
