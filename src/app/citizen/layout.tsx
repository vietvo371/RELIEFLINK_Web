"use client";

import CitizenSidebar from "@/layout/citizen/CitizenSidebar";
import CitizenHeader from "@/layout/citizen/CitizenHeader";
import { CitizenSidebarProvider, useCitizenSidebar } from "@/context/CitizenSidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import CitizenBackdrop from "@/layout/citizen/CitizenBackdrop";

function CitizenLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useCitizenSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <CitizenSidebar />
      <CitizenBackdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <CitizenHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xxl) md:p-4">{children}</div>
      </div>
    </div>
  ); 
}

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <CitizenSidebarProvider>
        <CitizenLayoutContent>{children}</CitizenLayoutContent>
      </CitizenSidebarProvider>
    </ThemeProvider>
  );
}

