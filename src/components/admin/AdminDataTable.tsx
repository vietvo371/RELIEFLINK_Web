"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminDataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }[];
  toolbarActions?: React.ReactNode;
  tableClassName?: string;
}

export default function AdminDataTable({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Không có dữ liệu",
  emptyDescription,
  emptyIcon,
  emptyAction,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  filters = [],
  toolbarActions,
  tableClassName = "",
}: AdminDataTableProps) {
  const hasToolbar = searchable || filters.length > 0 || Boolean(toolbarActions);

  return (
    <div className="space-y-4">
      {hasToolbar && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] md:flex-row md:items-center md:justify-between md:gap-4">
          {searchable && (
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {(filters.length > 0 || toolbarActions) && (
            <div className="flex w-full flex-wrap items-center justify-start gap-3 md:justify-end">
              {filters.map((filter) => (
                <div
                  key={filter.key}
                  className="w-full sm:w-auto sm:min-w-[180px]"
                >
                  <Select
                    options={filter.options}
                    placeholder={filter.label}
                    onChange={filter.onChange}
                    className="h-11"
                  />
                </div>
              ))}
              {toolbarActions && <div className="flex items-center gap-2">{toolbarActions}</div>}
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
        <div className="overflow-x-auto">
          <Table className={tableClassName}>
            <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    isHeader
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 first:pl-6 last:pr-6 dark:text-gray-400"
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="px-6 py-12 text-center"
                  >
                    <AdminLoading variant="section" label="Đang tải bảng dữ liệu..." />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="px-6 py-12"
                  >
                    <AdminEmptyState
                      variant="subtle"
                      compact
                      icon={emptyIcon}
                      title={emptyMessage}
                      description={emptyDescription}
                      action={emptyAction}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={index}
                    className="transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-500/10"
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className="px-6 py-4 text-sm text-gray-700 first:pl-6 last:pr-6 dark:text-gray-200"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
