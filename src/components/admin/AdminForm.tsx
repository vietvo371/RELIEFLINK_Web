"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Plus, Save, X } from "lucide-react";

interface FormField {
  key: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "datetime-local";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  gridCols?: number;
}

interface AdminFormProps {
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showCancelButton?: boolean;
  showDismissIcon?: boolean;
  className?: string;
  variant?: "card" | "borderless";
}

export default function AdminForm({
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = "Lưu",
  cancelText = "Hủy",
  showCancel = true,
  showCancelButton,
  showDismissIcon,
  className = "",
  variant = "card",
}: AdminFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      value: formData[field.key] || "",
      onChange: (e: any) => handleChange(field.key, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        );
      case "select":
        return (
          <Select
            options={field.options || []}
            placeholder={field.placeholder || `Chọn ${field.label.toLowerCase()}`}
            onChange={(value) => handleChange(field.key, value)}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            {...commonProps}
          />
        );
    }
  };

  const shouldShowCancelButton =
    (typeof showCancelButton === "boolean" ? showCancelButton : showCancel) &&
    Boolean(onCancel);
  const shouldShowDismissIcon =
    (typeof showDismissIcon === "boolean" ? showDismissIcon : showCancel) &&
    Boolean(onCancel);
  const containerClasses =
    (variant === "card"
      ? "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      : "") + (className ? ` ${className}` : "");

  return (
    <div className={containerClasses.trim()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {shouldShowDismissIcon && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div
              key={field.key}
              className={field.gridCols === 1 ? "md:col-span-2" : ""}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            startIcon={isLoading ? undefined : <Save className="w-4 h-4" />}
            className="flex-1"
          >
            {isLoading ? "Đang lưu..." : submitText}
          </Button>
          {shouldShowCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              startIcon={<X className="w-4 h-4" />}
            >
              {cancelText}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
