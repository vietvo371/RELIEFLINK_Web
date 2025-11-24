"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCitizenSidebar } from "@/context/CitizenSidebarContext";
import { HorizontaLDots } from "@/icons/index";
import { FileText, LayoutDashboard, User, Eye } from "lucide-react";
import SidebarWidget from "@/layout/SidebarWidget";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType;
};

const navItems: NavItem[] = [
  { name: "Trang chủ", href: "/citizen/dashboard", icon: LayoutDashboard },
  { name: "Yêu cầu của tôi", href: "/citizen/my-requests", icon: FileText },
  { name: "Trạng thái cứu trợ", href: "/citizen/status", icon: Eye },
  { name: "Hồ sơ", href: "/citizen/profile", icon: User },
];

const CitizenSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useCitizenSidebar();
  const pathname = usePathname();

  const renderNavigation = () => (
    <ul className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-500"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${
                !isExpanded && !isHovered ? "mx-auto" : "mr-3"
              }`} />
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-[60] border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0 mt-0" : "-translate-x-full mt-16"}
        lg:translate-x-0 lg:mt-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4 lg:py-8 flex items-center justify-between ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-between"
        }`}
      >
        <Link href="/citizen/dashboard" className="flex-1">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
        {/* Close button for mobile */}
        {isMobileOpen && (
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            aria-label="Close Sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderNavigation()}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <></> : null}
      </div>
    </aside>
  );
};

export default CitizenSidebar;