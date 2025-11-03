"use client";

import React, { createContext, useContext, useState } from "react";

interface VolunteerSidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const VolunteerSidebarContext = createContext<VolunteerSidebarContextType | undefined>(undefined);

export function VolunteerSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const openSidebar = () => {
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <VolunteerSidebarContext.Provider value={{ isOpen, toggle, openSidebar, closeSidebar }}>
      {children}
    </VolunteerSidebarContext.Provider>
  );
}

export function useVolunteerSidebar() {
  const context = useContext(VolunteerSidebarContext);
  if (context === undefined) {
    throw new Error("useVolunteerSidebar must be used within a VolunteerSidebarProvider");
  }
  return context;
}
