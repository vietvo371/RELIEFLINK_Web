import { useVolunteerSidebar } from "@/context/VolunteerSidebarContext";
import React from "react";

const VolunteerBackdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useVolunteerSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default VolunteerBackdrop;