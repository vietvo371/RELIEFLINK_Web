/**
 * Utility functions for translating status values to Vietnamese
 */

/**
 * Translate priority level to Vietnamese
 */
export function translatePriority(priority: string): string {
  const translations: Record<string, string> = {
    cao: "Cao",
    trung_binh: "Trung bình",
    thap: "Thấp",
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
  };
  return translations[priority] || priority;
}

/**
 * Translate request status to Vietnamese
 */
export function translateRequestStatus(status: string): string {
  const translations: Record<string, string> = {
    cho_xu_ly: "Chờ xử lý",
    dang_xu_ly: "Đang xử lý",
    hoan_thanh: "Hoàn thành",
    huy_bo: "Đã hủy bỏ",
  };
  return translations[status] || status;
}

/**
 * Translate distribution status to Vietnamese
 */
export function translateDistributionStatus(status: string): string {
  const translations: Record<string, string> = {
    dang_chuan_bi: "Đang chuẩn bị",
    dang_van_chuyen: "Đang vận chuyển",
    dang_giao: "Đang giao",
    hoan_thanh: "Hoàn thành",
    huy_bo: "Đã hủy bỏ",
  };
  return translations[status] || status;
}

/**
 * Get color for priority badge
 */
export function getPriorityColor(priority: string): string {
  if (priority === "cao" || priority === "high") return "error";
  if (priority === "trung_binh" || priority === "medium") return "warning";
  return "info";
}

/**
 * Get color for request status badge
 */
export function getRequestStatusColor(status: string): string {
  if (status === "hoan_thanh") return "success";
  if (status === "dang_xu_ly") return "warning";
  if (status === "huy_bo") return "error";
  return "info";
}

/**
 * Get color for distribution status badge
 */
export function getDistributionStatusColor(status: string): string {
  if (status === "hoan_thanh") return "success";
  if (status === "dang_giao") return "warning";
  if (status === "dang_van_chuyen") return "info";
  if (status === "huy_bo") return "error";
  return "light";
}


