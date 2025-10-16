"use client";

import AdminSidebar from "@/layout/admin/AdminSidebar";
import AdminHeader from "@/layout/admin/AdminHeader";
import { AdminSidebarProvider, useAdminSidebar } from "@/context/AdminSidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AdminBackdrop from "@/layout/admin/AdminBackdrop";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useAdminSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AdminSidebar />
      <AdminBackdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AdminHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  ); 
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AdminSidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminSidebarProvider>
    </ThemeProvider>
  );
}


