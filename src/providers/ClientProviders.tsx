"use client";

import { ToastProvider } from "@/context/ToastContext";
import QueryProvider from "@/providers/QueryProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <QueryProvider>{children}</QueryProvider>
    </ToastProvider>
  );
}

