import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RELIEFLINK - Disaster Relief Coordination",
  description: "Real-Time Disaster Relief Coordination Platform with AI forecasting and Blockchain transparency",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
          <ToastProvider>
            <QueryProvider>{children}</QueryProvider>
          </ToastProvider>
      </body>
    </html>
  );
}
