"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Eye,
  User,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

const citizenNavigation = [
  { name: "Trang chủ", href: "/citizen/dashboard", icon: LayoutDashboard },
  { name: "Yêu cầu của tôi", href: "/citizen/my-requests", icon: FileText },
  { name: "Trạng thái cứu trợ", href: "/citizen/status", icon: Eye },
  { name: "Hồ sơ", href: "/citizen/profile", icon: User },
];

export default function CitizenSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-green-700 to-green-900 dark:from-green-900 dark:to-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-green-600">
            <Users className="w-8 h-8 mr-2" />
            <div>
              <h1 className="text-xl font-bold">RELIEFLINK</h1>
              <p className="text-xs text-green-200">Người dân</p>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 py-4 border-b border-green-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.ho_va_ten}</p>
                  <p className="text-xs text-green-200">Người dân</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {citizenNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-green-900 shadow-lg"
                      : "text-green-100 hover:bg-green-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-green-600">
            <p className="text-xs text-green-200 text-center">
              © 2025 RELIEFLINK - Citizen
            </p>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
}

