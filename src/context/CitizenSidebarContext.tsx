"use client";

import React, { createContext, useContext, useState } from "react";

interface CitizenSidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const CitizenSidebarContext = createContext<CitizenSidebarContextType | undefined>(undefined);

export function CitizenSidebarProvider({ children }: { children: React.ReactNode }) {
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
    <CitizenSidebarContext.Provider value={{ isOpen, toggle, openSidebar, closeSidebar }}>
      {children}
    </CitizenSidebarContext.Provider>
  );
}

export function useCitizenSidebar() {
  const context = useContext(CitizenSidebarContext);
  if (context === undefined) {
    throw new Error("useCitizenSidebar must be used within a CitizenSidebarProvider");
  }
  return context;
}
