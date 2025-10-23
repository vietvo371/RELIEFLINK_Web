"use client";

import dynamic from "next/dynamic";
import { useRequests } from "@/hooks/useRequests";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { MapPin } from "lucide-react";

const MapView = dynamic(() => import("@/components/relief/MapView"), {
  ssr: false,
});

export default function AdminMapPage() {
  const { data, isLoading } = useRequests();
  const requests = data?.requests || [];

  const markers = requests
    .filter((r: any) => r.vi_do && r.kinh_do)
    .map((r: any) => ({ 
      id: r.id, 
      latitude: parseFloat(r.vi_do), 
      longitude: parseFloat(r.kinh_do), 
      title: r.loai_yeu_cau, 
      type: "request" as const 
    }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bản đồ cứu trợ toàn quốc"
        description="Hiển thị các điểm yêu cầu cứu trợ"
      />
      
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
        <div className="relative h-[600px] overflow-hidden rounded-2xl">
          {isLoading ? (
            <AdminLoading
              variant="section"
              label="Đang tải bản đồ cứu trợ..."
              className="h-full"
            />
          ) : markers.length > 0 ? (
            <MapView markers={markers} />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <AdminEmptyState
                icon={<MapPin className="h-6 w-6" aria-hidden />}
                title="Chưa có vị trí nào được ghi nhận"
                description="Các yêu cầu cứu trợ có tọa độ sẽ hiển thị trực tiếp trên bản đồ."
                variant="subtle"
                compact
                className="border-none bg-white/80 shadow-none dark:bg-gray-900/60"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
