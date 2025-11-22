"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  MapPin,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useCreateRequest, useUpdateRequest, useDeleteRequest } from "@/hooks/useRequests";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";
import { validateCoordinates, isWithinVietnamBounds } from "@/lib/locationValidation";
import { reverseGeocodeWithCountry } from "@/lib/geocoding";
import {
  getPriorityColor,
  getRequestStatusColor,
  translateApprovalStatus,
  translatePriority,
  translateRequestStatus,
} from "@/lib/translations";
// Define Request type locally
type Request = {
  id: number;
  loai_yeu_cau?: string | null;
  mo_ta?: string | null;
  dia_chi?: string | null;
  so_nguoi: number;
  do_uu_tien: string;
  trang_thai: string;
  trang_thai_phe_duyet: string;
  vi_do?: number | null;
  kinh_do?: number | null;
  created_at?: string | null;
};

type CreateRequestForm = {
  loai_yeu_cau: string;
  mo_ta: string;
  dia_chi: string;
  so_nguoi: string;
  do_uu_tien: "thap" | "trung_binh" | "cao" | "rat_cao";
};

const initialCreateForm: CreateRequestForm = {
  loai_yeu_cau: "",
  mo_ta: "",
  dia_chi: "",
  so_nguoi: "",
  do_uu_tien: "trung_binh",
};

type WorkflowRequest = Request & {
  nguoi_dung?: {
    ho_va_ten?: string | null;
    email?: string | null;
  };
  phan_phois?: Array<{
    id: number;
    nguon_luc?: { ten_nguon_luc?: string | null };
    tinh_nguyen_vien?: { ho_va_ten?: string | null };
    trang_thai: string;
  }>;
};

export default function CitizenRequestsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRequestForm>(initialCreateForm);
  const [createLocation, setCreateLocation] = useState<Coordinates | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<CreateRequestForm>(initialCreateForm);
  const [editLocation, setEditLocation] = useState<Coordinates | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLocationWarning, setEditLocationWarning] = useState<string | null>(null);
  const [isEditGeocoding, setIsEditGeocoding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch requests for current user - using query param
  const requestsParams = useMemo(() => {
    if (!user?.id) return "";
    const params = new URLSearchParams();
    params.append("id_nguoi_dung", String(user.id));
    return params.toString();
  }, [user?.id]);

  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ["requests", { id_nguoi_dung: user?.id }],
    queryFn: async () => {
      if (!user?.id) return { requests: [] };
      const params = new URLSearchParams();
      params.append("id_nguoi_dung", String(user.id));
      const res = await fetch(`/api/requests?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải danh sách yêu cầu");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  const createRequestMutation = useCreateRequest();
  const updateRequestMutation = useUpdateRequest(selectedRequest?.id || 0);
  const deleteRequestMutation = useDeleteRequest();

  // Filter and paginate requests
  const filteredRequests = useMemo(() => {
    if (!requestsData?.requests) return [];
    
    let filtered = requestsData.requests as WorkflowRequest[];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.loai_yeu_cau?.toLowerCase().includes(query) ||
          req.mo_ta?.toLowerCase().includes(query) ||
          req.dia_chi?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.trang_thai === statusFilter);
    }

    return filtered;
  }, [requestsData, searchQuery, statusFilter]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredRequests.slice(start, end);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);

  // Handlers
  const handleCreateFormChange = (field: keyof CreateRequestForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field: keyof CreateRequestForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateLocationChange = async (coords: Coordinates | null) => {
    setCreateLocation(coords);
    setLocationWarning(null);

    if (!coords) return;

    // Check bounds first
    const isInVietnam = isWithinVietnamBounds(coords.lat, coords.lng);
    if (!isInVietnam) {
      setLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
    }

    // Reverse geocode to get address and country
    setIsGeocoding(true);
    try {
      const { address, country } = await reverseGeocodeWithCountry(
        coords.lat,
        coords.lng
      );

      if (address) {
        setCreateForm((prev) => ({ ...prev, dia_chi: address }));
      }

      // Check country from geocoding API (MORE ACCURATE than bounds check)
      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");

      if (country && !isVietnamCountry) {
        setLocationWarning(`⚠️ Không phải lãnh thổ Việt Nam (${country})`);
      } else if (!isVietnamCountry && !isInVietnam) {
        setLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
      } else if (isVietnamCountry && !isInVietnam) {
        setLocationWarning(null);
      }
    } catch (error) {
      console.error("Error geocoding:", error);
      if (!isInVietnam) {
        setLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleEditLocationChange = async (coords: Coordinates | null) => {
    setEditLocation(coords);
    setEditLocationWarning(null);

    if (!coords) return;

    // Check bounds first
    const isInVietnam = isWithinVietnamBounds(coords.lat, coords.lng);
    if (!isInVietnam) {
      setEditLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
    }

    // Reverse geocode to get address and country
    setIsEditGeocoding(true);
    try {
      const { address, country } = await reverseGeocodeWithCountry(
        coords.lat,
        coords.lng
      );

      if (address) {
        setEditForm((prev) => ({ ...prev, dia_chi: address }));
      }

      // Check country from geocoding API
      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");

      if (country && !isVietnamCountry) {
        setEditLocationWarning(`⚠️ Không phải lãnh thổ Việt Nam (${country})`);
      } else if (!isVietnamCountry && !isInVietnam) {
        setEditLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
      } else if (isVietnamCountry && !isInVietnam) {
        setEditLocationWarning(null);
      }
    } catch (error) {
      console.error("Error geocoding:", error);
      if (!isInVietnam) {
        setEditLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
      }
    } finally {
      setIsEditGeocoding(false);
    }
  };

  const handleCreateRequest = async () => {
    const trimmedType = createForm.loai_yeu_cau.trim();
    if (!trimmedType) {
      showError("Vui lòng nhập loại yêu cầu.");
      setCreateError("Vui lòng nhập loại yêu cầu.");
      return;
    }
    if (trimmedType.length < 3) {
      showError("Loại yêu cầu cần tối thiểu 3 ký tự.");
      setCreateError("Loại yêu cầu cần tối thiểu 3 ký tự.");
      return;
    }

    const peopleCount = Number(createForm.so_nguoi);
    if (!Number.isFinite(peopleCount) || peopleCount <= 0) {
      showError("Số người ảnh hưởng phải lớn hơn 0.");
      setCreateError("Số người ảnh hưởng phải lớn hơn 0.");
      return;
    }

    if (!createLocation) {
      showError("Vui lòng chọn vị trí trên bản đồ.");
      setCreateError("Vui lòng chọn vị trí trên bản đồ.");
      return;
    }

    // Validate coordinates using reverse geocoding API (MOST ACCURATE)
    console.log("🔍 [CITIZEN CREATE] Validating location:", createLocation.lat, createLocation.lng);

    // First check bounds (quick validation)
    const coordValidation = validateCoordinates(
      createLocation.lat,
      createLocation.lng,
      true
    );

    console.log("📊 [CITIZEN CREATE] Validation result:", coordValidation);

    if (!coordValidation.isValid) {
      console.log("❌ [CITIZEN CREATE] Validation failed:", coordValidation.error);
      showError(coordValidation.error || "Tọa độ không hợp lệ.");
      setCreateError(coordValidation.error || "Tọa độ không hợp lệ.");
      return;
    }

    // CRITICAL: Use reverse geocoding to check ACTUAL country
    try {
      const { reverseGeocodeWithCountry } = await import("@/lib/geocoding");
      const { country } = await reverseGeocodeWithCountry(createLocation.lat, createLocation.lng);

      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");

      console.log("🌍 [CITIZEN CREATE] Geocoding country result:", country, "isVietnam:", isVietnamCountry);

      if (!isVietnamCountry) {
        console.log("🚫 [CITIZEN CREATE] BLOCKING: Country is not Vietnam:", country);
        showError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        setCreateError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        return;
      }
    } catch (error) {
      console.error("❌ [CITIZEN CREATE] Error checking country:", error);
      // If geocoding fails, fall back to bounds check
      const isInVietnam = isWithinVietnamBounds(createLocation.lat, createLocation.lng);
      if (!isInVietnam) {
        console.log("🚫 [CITIZEN CREATE] BLOCKING: Location outside Vietnam bounds (geocoding failed)");
        showError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        setCreateError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        return;
      }
      console.log("⚠️ [CITIZEN CREATE] Geocoding failed but bounds check passed - allowing with warning");
    }

    console.log("✅ [CITIZEN CREATE] Validation passed - location is in Vietnam");

    if (!user?.id) {
      showError("Vui lòng đăng nhập để tạo yêu cầu.");
      setCreateError("Vui lòng đăng nhập để tạo yêu cầu.");
      return;
    }

    setCreateError(null);

    createRequestMutation.mutate(
      {
        loai_yeu_cau: trimmedType,
        mo_ta: createForm.mo_ta.trim() || null,
        dia_chi: createForm.dia_chi.trim() || null,
        so_nguoi: peopleCount,
        do_uu_tien: createForm.do_uu_tien,
        trang_thai: "cho_xu_ly",
        vi_do: createLocation.lat,
        kinh_do: createLocation.lng,
        id_nguoi_dung: Number(user.id),
      },
      {
        onSuccess: () => {
          showSuccess("Tạo yêu cầu cứu trợ thành công!");
          setTimeout(() => {
            setCreateForm(initialCreateForm);
            setCreateLocation(null);
            setCreateError(null);
            setLocationWarning(null);
            setIsCreateModalOpen(false);
            refetch();
          }, 100);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể tạo yêu cầu.";
          setCreateError(message);
          showError(message);
        },
      },
    );
  };


  const handleOpenEdit = (request: WorkflowRequest) => {
    // Only allow edit if not yet approved
    if (request.trang_thai_phe_duyet === "da_phe_duyet") {
      showError("Không thể chỉnh sửa yêu cầu đã được phê duyệt.");
      return;
    }

    setSelectedRequest(request);
    setEditForm({
      loai_yeu_cau: request.loai_yeu_cau || "",
      mo_ta: request.mo_ta || "",
      dia_chi: request.dia_chi || "",
      so_nguoi: String(request.so_nguoi || ""),
      do_uu_tien: (request.do_uu_tien || "trung_binh") as "thap" | "trung_binh" | "cao" | "rat_cao",
    });
    setEditLocation(
      request.vi_do && request.kinh_do
        ? { lat: Number(request.vi_do), lng: Number(request.kinh_do) }
        : null
    );
    setEditLocationWarning(null);
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    // Only allow update if not yet approved
    if (selectedRequest.trang_thai_phe_duyet === "da_phe_duyet") {
      showError("Không thể chỉnh sửa yêu cầu đã được phê duyệt.");
      return;
    }

    const trimmedType = editForm.loai_yeu_cau.trim();
    if (!trimmedType) {
      showError("Vui lòng nhập loại yêu cầu.");
      setEditError("Vui lòng nhập loại yêu cầu.");
      return;
    }

    const peopleCount = Number(editForm.so_nguoi);
    if (!Number.isFinite(peopleCount) || peopleCount <= 0) {
      showError("Số người ảnh hưởng phải lớn hơn 0.");
      setEditError("Số người ảnh hưởng phải lớn hơn 0.");
      return;
    }

    // Always send location (either updated or existing)
    const locationToValidate = editLocation ??
      (selectedRequest.vi_do !== null && selectedRequest.vi_do !== undefined &&
        selectedRequest.kinh_do !== null && selectedRequest.kinh_do !== undefined
        ? { lat: Number(selectedRequest.vi_do), lng: Number(selectedRequest.kinh_do) }
        : null);

    if (!locationToValidate) {
      showError("Yêu cầu phải có vị trí hợp lệ trong lãnh thổ Việt Nam.");
      setEditError("Yêu cầu phải có vị trí hợp lệ trong lãnh thổ Việt Nam.");
      return;
    }

    // Validate location using reverse geocoding
    console.log("🔍 [CITIZEN UPDATE] Validating location:", locationToValidate);

    const coordValidation = validateCoordinates(
      locationToValidate.lat,
      locationToValidate.lng,
      true
    );

    if (!coordValidation.isValid) {
      showError(coordValidation.error || "Tọa độ không hợp lệ.");
      setEditError(coordValidation.error || "Tọa độ không hợp lệ.");
      return;
    }

    // CRITICAL: Use reverse geocoding to check ACTUAL country
    try {
      const { reverseGeocodeWithCountry } = await import("@/lib/geocoding");
      const { country } = await reverseGeocodeWithCountry(locationToValidate.lat, locationToValidate.lng);

      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");

      console.log("🌍 [CITIZEN UPDATE] Geocoding country result:", country, "isVietnam:", isVietnamCountry);

      if (!isVietnamCountry) {
        console.log("🚫 [CITIZEN UPDATE] BLOCKING: Country is not Vietnam:", country);
        showError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        setEditError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        return;
      }
    } catch (error) {
      console.error("❌ [CITIZEN UPDATE] Error checking country:", error);
      const isInVietnam = isWithinVietnamBounds(locationToValidate.lat, locationToValidate.lng);
      if (!isInVietnam) {
        showError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        setEditError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        return;
      }
    }

    const finalLocation = editLocation ??
      (selectedRequest.vi_do !== null && selectedRequest.vi_do !== undefined &&
        selectedRequest.kinh_do !== null && selectedRequest.kinh_do !== undefined
        ? { lat: Number(selectedRequest.vi_do), lng: Number(selectedRequest.kinh_do) }
        : null);

    if (!finalLocation) {
      showError("Yêu cầu phải có vị trí hợp lệ.");
      setEditError("Yêu cầu phải có vị trí hợp lệ.");
      return;
    }

    updateRequestMutation.mutate(
      {
        loai_yeu_cau: trimmedType,
        mo_ta: editForm.mo_ta.trim() || null,
        dia_chi: editForm.dia_chi.trim() || null,
        so_nguoi: peopleCount,
        do_uu_tien: editForm.do_uu_tien,
        vi_do: finalLocation.lat,
        kinh_do: finalLocation.lng,
      },
      {
        onSuccess: () => {
          showSuccess("Cập nhật yêu cầu thành công!");
          setTimeout(() => {
            setIsEditModalOpen(false);
            setSelectedRequest(null);
            refetch();
          }, 100);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể cập nhật yêu cầu.";
          setEditError(message);
          showError(message);
        },
      },
    );
  };

  const handleDeleteRequest = (requestId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) return;

    deleteRequestMutation.mutate(requestId, {
      onSuccess: () => {
        showSuccess("Xóa yêu cầu thành công!");
        refetch();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Không thể xóa yêu cầu.";
        showError(message);
      },
    });
  };

  const canEdit = (request: WorkflowRequest) => {
    return request.trang_thai_phe_duyet !== "da_phe_duyet";
  };

  const canDelete = (request: WorkflowRequest) => {
    return request.trang_thai_phe_duyet !== "da_phe_duyet";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Yêu cầu của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi và quản lý các yêu cầu cứu trợ của bạn
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm yêu cầu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            defaultValue={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "cho_xu_ly", label: "Chờ xử lý" },
              { value: "dang_xu_ly", label: "Đang xử lý" },
              { value: "hoan_thanh", label: "Hoàn thành" },
              { value: "huy", label: "Hủy" },
            ]}
          />
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      ) : paginatedRequests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {filteredRequests.length === 0 && requestsData?.requests?.length
              ? "Không tìm thấy yêu cầu nào"
              : "Chưa có yêu cầu nào"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filteredRequests.length === 0 && requestsData?.requests?.length
              ? "Thử thay đổi bộ lọc tìm kiếm"
              : "Hãy tạo yêu cầu cứu trợ nếu bạn cần hỗ trợ"}
          </p>
          {filteredRequests.length === 0 && !requestsData?.requests?.length && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
            Tạo yêu cầu đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Loại yêu cầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Số người
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Độ ưu tiên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phê duyệt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.loai_yeu_cau}
                        </div>
                        {request.dia_chi && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {request.dia_chi}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          <Users className="w-4 h-4" />
                          {request.so_nguoi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getPriorityColor(request.do_uu_tien) as any} size="sm">
                          {translatePriority(request.do_uu_tien)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getRequestStatusColor(request.trang_thai) as any} size="sm">
                          {translateRequestStatus(request.trang_thai)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          color={
                            request.trang_thai_phe_duyet === "da_phe_duyet"
                              ? "success"
                              : request.trang_thai_phe_duyet === "tu_choi"
                              ? "error"
                              : "warning"
                          }
                          size="sm"
                        >
                          {translateApprovalStatus(request.trang_thai_phe_duyet)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {request.created_at
                          ? format(new Date(request.created_at), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/citizen/my-requests/${request.id}`)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEdit(request) && (
                            <button
                              onClick={() => handleOpenEdit(request)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete(request) && (
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredRequests.length)} trong tổng số {filteredRequests.length} yêu cầu
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tạo yêu cầu cứu trợ mới
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {createError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại yêu cầu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={createForm.loai_yeu_cau}
                    onChange={(e) => handleCreateFormChange("loai_yeu_cau", e.target.value)}
                    placeholder="VD: Thực phẩm, Nước uống, Thuốc men..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={createForm.mo_ta}
                    onChange={(e) => handleCreateFormChange("mo_ta", e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="Nhập mô tả ngắn gọn về tình hình cần cứu trợ..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số người ảnh hưởng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={createForm.so_nguoi}
                    onChange={(e) => handleCreateFormChange("so_nguoi", e.target.value)}
                    placeholder="Nhập số người"
                    min="1"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Độ ưu tiên
                  </label>
                  <Select
                    defaultValue={createForm.do_uu_tien}
                    onChange={(value) => handleCreateFormChange("do_uu_tien", value)}
                    options={[
                      { value: "thap", label: "Thấp" },
                      { value: "trung_binh", label: "Trung bình" },
                      { value: "cao", label: "Cao" },
                      { value: "rat_cao", label: "Rất cao" },
                    ]}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Địa chỉ (tự động điền từ bản đồ)
                  </label>
                  <Input
                    type="text"
                    value={createForm.dia_chi}
                    onChange={(e) => handleCreateFormChange("dia_chi", e.target.value)}
                    placeholder="Địa chỉ sẽ được tự động điền khi chọn vị trí trên bản đồ"
                    disabled={isGeocoding}
                  />
                  {isGeocoding && (
                    <p className="mt-1 text-xs text-gray-500">Đang tải địa chỉ...</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vị trí trên bản đồ <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Nhấp vào bản đồ để chọn vị trí chính xác
                    </span>
                  </div>
                  <MapLocationPicker
                    value={createLocation}
                    onChange={handleCreateLocationChange}
                    isActive={isCreateModalOpen}
                  />
                  {locationWarning && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-yellow-700 dark:text-yellow-400 text-sm">
                      {locationWarning}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                onClick={() => setIsCreateModalOpen(false)}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateRequest}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={createRequestMutation.isPending}
              >
                {createRequestMutation.isPending ? "Đang tạo..." : "Tạo yêu cầu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure to Create Modal */}
      {isEditModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Chỉnh sửa yêu cầu #{selectedRequest.id}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {editError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại yêu cầu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editForm.loai_yeu_cau}
                    onChange={(e) => handleEditFormChange("loai_yeu_cau", e.target.value)}
                    placeholder="VD: Thực phẩm, Nước uống, Thuốc men..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={editForm.mo_ta}
                    onChange={(e) => handleEditFormChange("mo_ta", e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="Nhập mô tả ngắn gọn về tình hình cần cứu trợ..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số người ảnh hưởng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={editForm.so_nguoi}
                    onChange={(e) => handleEditFormChange("so_nguoi", e.target.value)}
                    placeholder="Nhập số người"
                    min="1"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Độ ưu tiên
                  </label>
                  <Select
                    defaultValue={editForm.do_uu_tien}
                    onChange={(value) => handleEditFormChange("do_uu_tien", value)}
                    options={[
                      { value: "thap", label: "Thấp" },
                      { value: "trung_binh", label: "Trung bình" },
                      { value: "cao", label: "Cao" },
                      { value: "rat_cao", label: "Rất cao" },
                    ]}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Địa chỉ (tự động điền từ bản đồ)
                  </label>
                  <Input
                    type="text"
                    value={editForm.dia_chi}
                    onChange={(e) => handleEditFormChange("dia_chi", e.target.value)}
                    placeholder="Địa chỉ sẽ được tự động điền khi chọn vị trí trên bản đồ"
                    disabled={isEditGeocoding}
                  />
                  {isEditGeocoding && (
                    <p className="mt-1 text-xs text-gray-500">Đang tải địa chỉ...</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vị trí trên bản đồ <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Nhấp vào bản đồ để chọn vị trí chính xác
                    </span>
                  </div>
                  <MapLocationPicker
                    value={editLocation}
                    onChange={handleEditLocationChange}
                    isActive={isEditModalOpen}
                  />
                  {editLocationWarning && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-yellow-700 dark:text-yellow-400 text-sm">
                      {editLocationWarning}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                onClick={() => setIsEditModalOpen(false)}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdateRequest}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={updateRequestMutation.isPending}
              >
                {updateRequestMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
