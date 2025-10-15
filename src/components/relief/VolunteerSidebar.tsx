"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Truck,
  Package,
  User,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

const volunteerNavigation = [
  { name: "Dashboard", href: "/volunteer/dashboard", icon: LayoutDashboard },
  { name: "Yêu cầu cứu trợ", href: "/volunteer/requests", icon: FileText },
  { name: "Phân phối của tôi", href: "/volunteer/my-distributions", icon: Truck },
  { name: "Nguồn lực", href: "/volunteer/resources", icon: Package },
  { name: "Hồ sơ", href: "/volunteer/profile", icon: User },
];

export default function VolunteerSidebar() {
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-700 to-blue-900 dark:from-blue-900 dark:to-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-blue-600">
            <Heart className="w-8 h-8 mr-2" />
            <div>
              <h1 className="text-xl font-bold">RELIEFLINK</h1>
              <p className="text-xs text-blue-200">Tình nguyện viên</p>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 py-4 border-b border-blue-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Heart size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.ho_va_ten}</p>
                  <p className="text-xs text-blue-200">Tình nguyện viên</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {volunteerNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-blue-900 shadow-lg"
                      : "text-blue-100 hover:bg-blue-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-blue-600">
            <p className="text-xs text-blue-200 text-center">
              © 2025 RELIEFLINK - Volunteer
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

