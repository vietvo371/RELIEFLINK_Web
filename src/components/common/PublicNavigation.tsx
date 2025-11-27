"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface PublicNavigationProps {
  scrolled: boolean;
  variant?: "default" | "map";
}

export default function PublicNavigation({ scrolled, variant = "default" }: PublicNavigationProps) {
  const navItems = [
    { label: "Tính năng", href: variant === "map" ? "/#features" : "#features" },
    { label: "Bản đồ", href: "/map" },
    { label: "Cách hoạt động", href: variant === "map" ? "/#how-it-works" : "#how-it-works" },
    { label: "Thống kê", href: variant === "map" ? "/#stats" : "#stats" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-theme-lg border-b border-gray-200/50 dark:border-gray-800/50"
          : variant === "map"
            ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
            : "bg-transparent"
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo/logo.svg" alt="ReliefLink Logo" className="h-8 w-auto" />
            </Link>
            {variant === "map" && (
              <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 border border-success-200/50 dark:border-success-700/50">
                <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-1.5 animate-pulse"></span>
                Bản đồ trực tiếp
              </span>
            )}
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden gap-8 md:flex">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors relative group ${
                  variant === "map" && item.label === "Bản đồ"
                    ? "text-success-600 dark:text-success-400"
                    : "text-gray-700 hover:text-success-600 dark:text-gray-300 dark:hover:text-success-400"
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-success-500 to-success-600 transition-all ${
                  variant === "map" && item.label === "Bản đồ" ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </motion.a>
            ))}
          </div>

          {/* Auth Buttons */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-all rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-success-500 to-success-600 hover:shadow-lg hover:shadow-success-500/50 hover:scale-105"
            >
              Đăng ký
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}

