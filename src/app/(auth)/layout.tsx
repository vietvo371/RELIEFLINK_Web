
"use client";

import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force light theme for auth pages
  useEffect(() => {
    // Remove dark class immediately
    document.documentElement.classList.remove("dark");
    
    // Also remove from localStorage temporarily for auth pages
    const originalTheme = localStorage.getItem("theme");
    localStorage.setItem("theme", "light");
    
    return () => {
      // Restore original theme when leaving auth pages
      if (originalTheme) {
        localStorage.setItem("theme", originalTheme);
      }
    };
  }, []);

  return (
    <div className="auth-layout relative p-6 bg-white z-1 sm:p-0">
      <ThemeProvider>
        <div className="auth-layout relative flex lg:flex-row w-full h-screen justify-center flex-col sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 lg:grid items-center hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                className="w-full h-full object-cover"
                fill
                priority
                src="/images/logo/RELIEFLINK/logoauth.svg"
                alt="Logo"
              />
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
