import { useVolunteerSidebar } from "@/context/VolunteerSidebarContext";
import React from "react";

const VolunteerBackdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useVolunteerSidebar();

  if (!isMobileOpen) return null;

  return (
    <>
      {/* Backdrop chỉ che phần content, không che sidebar */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[50] bg-gray-900/50 backdrop-blur-sm lg:hidden"
        style={{ left: '290px' }}
        onClick={toggleMobileSidebar}
      />
    </>
  );
};

export default VolunteerBackdrop;