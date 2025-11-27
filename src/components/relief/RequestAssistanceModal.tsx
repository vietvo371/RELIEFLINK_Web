"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { reverseGeocodeWithCountry } from "@/lib/geocoding";
import { isWithinVietnamBounds, validateCoordinates } from "@/lib/locationValidation";

// Import MapLocationPicker dynamically to prevent SSR issues
const MapLocationPicker = dynamic(
    () => import("@/components/admin/MapLocationPicker"),
    {
        ssr: false,
        loading: () => (
            <div className="h-[260px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-success-200 border-t-success-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Đang tải bản đồ...</p>
                </div>
            </div>
        ),
    }
);

interface RequestAssistanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialLocation?: { lng: number; lat: number; address?: string };
}

interface Coordinates {
    lat: number;
    lng: number;
}

export default function RequestAssistanceModal({
    isOpen,
    onClose,
    initialLocation,
}: RequestAssistanceModalProps) {
    const api = useApi();
    const { success: showSuccess, error: showError } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [locationWarning, setLocationWarning] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        ho_va_ten: "",
        so_dien_thoai: "",
        email: "",
        loai_yeu_cau: "",
        mo_ta: "",
        so_nguoi: "",
        do_uu_tien: "trung_binh",
        dia_chi: initialLocation?.address || "",
    });

    const [location, setLocation] = useState<Coordinates | null>(
        initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
    );

    // Update location and address when initialLocation changes
    useEffect(() => {
        if (initialLocation) {
            setLocation({ lat: initialLocation.lat, lng: initialLocation.lng });
            if (initialLocation.address) {
                setFormData(prev => ({ ...prev, dia_chi: initialLocation.address || "" }));
            }
        }
    }, [initialLocation]);

    // Handle location change from map picker
    const handleLocationChange = async (coords: Coordinates | null) => {
        setLocation(coords);
        setLocationWarning(null);
        setFormError(null);

        if (!coords) return;

        // Check bounds first (quick validation)
        const isInVietnam = isWithinVietnamBounds(coords.lat, coords.lng);
        if (!isInVietnam) {
            setLocationWarning("⚠️ Vị trí này có thể không thuộc lãnh thổ Việt Nam");
        }

        // Reverse geocode to get address and country
        setIsGeocoding(true);
        try {
            const { address, country } = await reverseGeocodeWithCountry(coords.lat, coords.lng);

            if (address) {
                setFormData(prev => ({ ...prev, dia_chi: address }));
            }

            // Check country from geocoding API (MORE ACCURATE than bounds check)
            const countryLower = country?.toLowerCase() || "";
            const isVietnamCountry = 
                countryLower === "việt nam" || 
                countryLower === "vietnam" || 
                countryLower.includes("vietnam");

            if (country && !isVietnamCountry) {
                setLocationWarning(`⚠️ Vị trí này thuộc ${country}, không phải Việt Nam`);
            } else if (isVietnamCountry) {
                setLocationWarning(null);
            }
        } catch (error) {
            console.error("Error geocoding:", error);
            if (!isInVietnam) {
                setLocationWarning("⚠️ Không thể xác định địa chỉ. Vị trí có thể không hợp lệ.");
            }
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Validate required fields
        if (!formData.ho_va_ten.trim()) {
            setFormError("Vui lòng nhập họ và tên");
            showError("Vui lòng nhập họ và tên");
            return;
        }

        if (!formData.so_dien_thoai.trim()) {
            setFormError("Vui lòng nhập số điện thoại");
            showError("Vui lòng nhập số điện thoại");
            return;
        }

        if (!formData.loai_yeu_cau) {
            setFormError("Vui lòng chọn loại yêu cầu");
            showError("Vui lòng chọn loại yêu cầu");
            return;
        }

        if (!formData.mo_ta.trim()) {
            setFormError("Vui lòng nhập mô tả chi tiết");
            showError("Vui lòng nhập mô tả chi tiết");
            return;
        }

        const peopleCount = Number(formData.so_nguoi);
        if (!Number.isFinite(peopleCount) || peopleCount <= 0) {
            setFormError("Số người phải lớn hơn 0");
            showError("Số người phải lớn hơn 0");
            return;
        }

        // Validate location
        if (!location) {
            setFormError("Vui lòng chọn vị trí trên bản đồ");
            showError("Vui lòng chọn vị trí trên bản đồ");
            return;
        }

        // Validate coordinates
        const coordValidation = validateCoordinates(location.lat, location.lng, true);
        if (!coordValidation.isValid) {
            setFormError(coordValidation.error || "Tọa độ không hợp lệ");
            showError(coordValidation.error || "Tọa độ không hợp lệ");
            return;
        }

        // Check if location is in Vietnam using geocoding API
        try {
            const { country } = await reverseGeocodeWithCountry(location.lat, location.lng);
            const countryLower = country?.toLowerCase() || "";
            const isVietnamCountry = 
                countryLower === "việt nam" || 
                countryLower === "vietnam" || 
                countryLower.includes("vietnam");

            if (!isVietnamCountry && country) {
                setFormError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country}`);
                showError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam`);
                return;
            }
        } catch (error) {
            // If geocoding fails, fall back to bounds check
            const isInVietnam = isWithinVietnamBounds(location.lat, location.lng);
            if (!isInVietnam) {
                setFormError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam");
                showError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            await api.post(
                "/api/requests",
                {
                    ho_va_ten: formData.ho_va_ten.trim(),
                    so_dien_thoai: formData.so_dien_thoai.trim(),
                    email: formData.email.trim() || null,
                    loai_yeu_cau: formData.loai_yeu_cau,
                    mo_ta: formData.mo_ta.trim(),
                    so_nguoi: peopleCount,
                    do_uu_tien: formData.do_uu_tien,
                    dia_chi: formData.dia_chi.trim() || null,
                    vi_do: location.lat,
                    kinh_do: location.lng,
                    // Flag to indicate this is an anonymous request
                    anonymous: true,
                },
                {
                    showSuccessToast: true,
                    successMessage: "✅ Yêu cầu cứu trợ đã được gửi thành công!",
                }
            );

            // Reset form
            setFormData({
                ho_va_ten: "",
                so_dien_thoai: "",
                email: "",
                loai_yeu_cau: "",
                mo_ta: "",
                so_nguoi: "",
                do_uu_tien: "trung_binh",
                dia_chi: "",
            });
            setLocation(null);
            setLocationWarning(null);
            setFormError(null);

            onClose();
        } catch (error) {
            console.error("Error submitting request:", error);
            const message = error instanceof Error ? error.message : "Không thể gửi yêu cầu";
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-success-500 to-success-600 text-white p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">Yêu cầu cứu trợ</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-white/90 mt-2">
                                    Điền thông tin để gửi yêu cầu hỗ trợ. Chúng tôi sẽ phản hồi sớm nhất có thể.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Error Display */}
                                {formError && (
                                    <div className="bg-error-50 dark:bg-error-900/20 rounded-lg p-4 flex items-center gap-2 text-error-700 dark:text-error-400">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formError}
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm">1</span>
                                        Thông tin liên hệ
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Họ và tên <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.ho_va_ten}
                                                onChange={(e) => setFormData({ ...formData, ho_va_ten: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                                placeholder="Nguyễn Văn A"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Số điện thoại <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.so_dien_thoai}
                                                onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                                placeholder="0123456789"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email (không bắt buộc)
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                            placeholder="nguyenvana@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Request Details */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm">2</span>
                                        Chi tiết yêu cầu
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Loại yêu cầu <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={formData.loai_yeu_cau}
                                                onChange={(e) => setFormData({ ...formData, loai_yeu_cau: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                            >
                                                <option value="">Chọn loại yêu cầu</option>
                                                <option value="Thực phẩm">🍚 Thực phẩm</option>
                                                <option value="Nước uống">💧 Nước uống</option>
                                                <option value="Thuốc men">💊 Thuốc men</option>
                                                <option value="Quần áo">👕 Quần áo</option>
                                                <option value="Chăn màn">🛏️ Chăn màn</option>
                                                <option value="Cứu hộ">🚨 Cứu hộ khẩn cấp</option>
                                                <option value="Khác">📦 Khác</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Độ ưu tiên <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={formData.do_uu_tien}
                                                onChange={(e) => setFormData({ ...formData, do_uu_tien: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                            >
                                                <option value="thap">🟢 Thấp</option>
                                                <option value="trung_binh">🟡 Trung bình</option>
                                                <option value="cao">🟠 Cao</option>
                                                <option value="khan_cap">🔴 Khẩn cấp</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Số người cần hỗ trợ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.so_nguoi}
                                            onChange={(e) => setFormData({ ...formData, so_nguoi: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                            placeholder="Số người cần hỗ trợ"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mô tả chi tiết <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.mo_ta}
                                            onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all resize-none"
                                            placeholder="Mô tả chi tiết về tình trạng và nhu cầu cứu trợ..."
                                        />
                                    </div>
                                </div>

                                {/* Location Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm">3</span>
                                        Vị trí cần cứu trợ
                                    </h3>

                                    {/* Address Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Địa chỉ <span className="text-gray-400">(tự động điền khi chọn trên bản đồ)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.dia_chi}
                                                onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })}
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                                placeholder="Địa chỉ sẽ được tự động điền..."
                                                disabled={isGeocoding}
                                            />
                                            {isGeocoding && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-red-500"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Map Location Picker */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Vị trí trên bản đồ <span className="text-red-500">*</span>
                                            </label>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                👆 Nhấp vào bản đồ để chọn vị trí
                                            </span>
                                        </div>
                                        
                                        <MapLocationPicker
                                            value={location}
                                            onChange={handleLocationChange}
                                            isActive={isOpen}
                                            height={280}
                                            markerColor="#EF4444"
                                            instructions="Nhấp vào bản đồ để chọn vị trí cần cứu trợ"
                                        />

                                        {/* Location Warning */}
                                        {locationWarning && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-yellow-700 dark:text-yellow-400 text-sm flex items-center gap-2">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                {locationWarning}
                                            </div>
                                        )}

                                        {/* Selected Location Info */}
                                        {location && (
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>
                                                    Đã chọn vị trí: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isGeocoding}
                                        className="px-6 py-2.5 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-lg hover:shadow-lg hover:shadow-success-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Gửi yêu cầu cứu trợ
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
