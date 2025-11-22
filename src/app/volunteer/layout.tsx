"use client";

import VolunteerSidebar from "@/layout/volunteer/VolunteerSidebar";
import VolunteerHeader from "@/layout/volunteer/VolunteerHeader";
import { VolunteerSidebarProvider, useVolunteerSidebar } from "@/context/VolunteerSidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import VolunteerBackdrop from "@/layout/volunteer/VolunteerBackdrop";

function VolunteerLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useVolunteerSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <VolunteerSidebar />
      <VolunteerBackdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <VolunteerHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xxl) md:p-4">{children}</div>
      </div>
    </div>
  ); 
}

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <VolunteerSidebarProvider>
        <VolunteerLayoutContent>{children}</VolunteerLayoutContent>
      </VolunteerSidebarProvider>
    </ThemeProvider>
  );
}

