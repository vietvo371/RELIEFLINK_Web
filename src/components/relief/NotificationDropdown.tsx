/**
 * NotificationDropdown Component
 * Hiển thị thông báo realtime với dropdown
 */

import React, { useState } from "react";
import { Bell, Check, X, AlertTriangle, Package, UserCheck } from "lucide-react";
import { useNotifications, useMarkNotificationsRead, useUnreadNotifications } from "@/hooks/useWorkflow";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = "" }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notificationsData } = useNotifications(10);
  const { data: unreadData } = useUnreadNotifications();
  const markAsRead = useMarkNotificationsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadData?.unreadCount || 0;

  const handleMarkAsRead = (notificationIds: number[]) => {
    markAsRead.mutate(notificationIds);
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.da_doc).map(n => n.id);
    if (unreadIds.length > 0) {
      handleMarkAsRead(unreadIds);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "yeu_cau_moi":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "phe_duyet":
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case "tu_choi":
        return <X className="h-4 w-4 text-red-500" />;
      case "phan_phoi":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "khan_cap":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (type: string) => {
    if (type === "khan_cap") {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Khẩn cấp
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Thông báo
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-red-600">
                    ({unreadCount} mới)
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Đánh dấu tất cả
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                <div className="py-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        !notification.da_doc
                          ? "border-l-blue-500 bg-blue-50"
                          : "border-l-transparent"
                      }`}
                      onClick={() => {
                        if (!notification.da_doc) {
                          handleMarkAsRead([notification.id]);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.loai_thong_bao)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.da_doc ? "text-gray-900" : "text-gray-700"
                            }`}>
                              {notification.tieu_de}
                            </p>
                            {getPriorityBadge(notification.loai_thong_bao)}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.noi_dung}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {notification.nguoi_gui.ho_va_ten} • {notification.nguoi_gui.vai_tro}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </p>
                          </div>

                          {/* Unread indicator */}
                          {!notification.da_doc && (
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t bg-gray-50">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}