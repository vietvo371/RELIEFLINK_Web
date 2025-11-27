"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import RequestAssistanceModal from "@/components/relief/RequestAssistanceModal";
import PublicNavigation from "@/components/common/PublicNavigation";

// Import MapboxMap dynamically with SSR disabled to prevent hydration errors
const MapboxMap = dynamic(() => import("@/components/ui/map/MapboxMap"), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="text-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-success-200 border-t-success-600 mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🗺️</span>
                    </div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Đang tải bản đồ...</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    ),
});

export default function PublicMapPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lng: number;
        lat: number;
        address?: string;
    } | undefined>();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="h-screen w-screen overflow-hidden ">
            {/* Navigation - Shared Component */}
            <PublicNavigation scrolled={scrolled} variant="map" />

            {/* Full Screen Map Container */}
            <div className="absolute inset-0 pt-16 sm:pt-20 top-20">
                <MapboxMap className="w-full h-full" />
            </div>

            {/* Floating Action Button - Request Assistance */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.08, boxShadow: "0 0 40px rgba(229, 22, 22, 0.7)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 px-6 py-4 bg-red-500 text-white rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_50px_rgba(239,68,68,0.7)] flex items-center gap-3 group border-2 border-white/30 backdrop-blur-sm"
            >
                {/* Animated glow ring */}
                <motion.div
                    animate={{ 
                        boxShadow: [
                            "0 0 20px rgba(245, 6, 22, 0.4)",
                            "0 0 40px rgba(239, 68, 68, 0.8)",
                            "0 0 20px rgba(249, 11, 11, 0.4)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl"
                />
                
                <div className="relative z-10">
                    <svg
                        className="w-6 h-6 drop-shadow-lg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <span className="relative z-10 font-bold text-base tracking-wide drop-shadow-md">Yêu cầu hỗ trợ khẩn cấp</span>
                
                {/* Pulsing indicator */}
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] border-2 border-white z-20"
                />
            </motion.button>

            {/* Request Modal */}
            <RequestAssistanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialLocation={selectedLocation}
            />
        </div>
    );
}
