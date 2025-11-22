import { useCitizenSidebar } from "@/context/CitizenSidebarContext";
import React from "react";

const CitizenBackdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useCitizenSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default CitizenBackdrop;