"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  LifeBuoy,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Users,
  CheckCircle,
  XCircle,
  Timer,
  Target,
  Zap,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminLoading from "@/components/admin/AdminLoading";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import {
  getPriorityColor,
  getRequestStatusColor,
  translateApprovalStatus,
  translateDistributionStatus,
  translateMatchingStatus,
  translatePriority,
  translateRequestStatus,
} from "@/lib/translations";
import { useRequests, useCreateRequest, useUpdateRequest } from "@/hooks/useRequests";
import { useApproveRequest, useTriggerAutoMatch } from "@/hooks/useWorkflow";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/context/ToastContext";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";
import { validateCoordinates, isWithinVietnamBounds } from "@/lib/locationValidation";
import { reverseGeocode, reverseGeocodeWithCountry } from "@/lib/geocoding";

// Define BadgeColor type locally since it's not exported
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

type ReliefUser = {
  ho_va_ten?: string | null;
  email?: string | null;
  so_dien_thoai?: string | null;
};

type AdminUser = {
  id: number;
  ho_va_ten?: string | null;
  email?: string | null;
  so_dien_thoai?: string | null;
};

type ReliefDistribution = {
  id: number;
  trang_thai: string;
  nguon_luc?: { ten_nguon_luc?: string | null } | null;
  tinh_nguyen_vien?: { ho_va_ten?: string | null } | null;
};

type ReliefRequest = {
  id: number;
  loai_yeu_cau: string;
  mo_ta?: string | null;
  so_nguoi: number;
  do_uu_tien: string;
  trang_thai: string;
  vi_do?: number | string | null;
  kinh_do?: number | string | null;
  created_at: string;
  nguoi_dung?: ReliefUser | null;
  phan_phois?: ReliefDistribution[];
};

type CreateRequestForm = {
  loai_yeu_cau: string;
  mo_ta: string;
  dia_chi: string; // Địa chỉ dạng text (optional)
  so_nguoi: string;
  do_uu_tien: string;
  trang_thai: string;
  vi_do: string;
  kinh_do: string;
};

type ApprovalStatus = 'cho_phe_duyet' | 'da_phe_duyet' | 'tu_choi';
type MatchingStatus = 'chua_match' | 'da_match' | 'khong_match';

interface WorkflowRequest extends ReliefRequest {
  trang_thai_phe_duyet?: ApprovalStatus;
  id_nguoi_phe_duyet?: number;
  thoi_gian_phe_duyet?: string;
  ly_do_tu_choi?: string;
  diem_uu_tien?: number;
  khoang_cach_gan_nhat?: number;
  id_nguon_luc_match?: number;
  trang_thai_matching?: MatchingStatus;
  nguoi_phe_duyet?: { ho_va_ten?: string; vai_tro?: string };
  nguon_luc_match?: {
    id?: number;
    ten_nguon_luc?: string;
    loai?: string;
    so_luong?: number;
    don_vi?: string;
    trung_tam?: {
      id?: number;
      ten_trung_tam?: string;
      dia_chi?: string;
      vi_do?: number | null;
      kinh_do?: number | null;
    };
  };
}

const initialCreateForm: CreateRequestForm = {
  loai_yeu_cau: "",
  mo_ta: "",
  dia_chi: "",
  so_nguoi: "",
  do_uu_tien: "trung_binh",
  trang_thai: "cho_xu_ly",
  vi_do: "",
  kinh_do: "",
};

const prioritySelectOptions = [
  { value: "cao", label: translatePriority("cao") },
  { value: "trung_binh", label: translatePriority("trung_binh") },
  { value: "thap", label: translatePriority("thap") },
];

const statusSelectOptions = [
  { value: "cho_xu_ly", label: translateRequestStatus("cho_xu_ly") },
  { value: "dang_xu_ly", label: translateRequestStatus("dang_xu_ly") },
  { value: "hoan_thanh", label: translateRequestStatus("hoan_thanh") },
  { value: "huy_bo", label: translateRequestStatus("huy_bo") },
];

const approvalStatusOptions = [
  { value: "cho_phe_duyet", label: "Chờ phê duyệt" },
  { value: "da_phe_duyet", label: "Đã phê duyệt" },
  { value: "tu_choi", label: "Đã từ chối" },
];

const matchingStatusOptions = [
  { value: "chua_match", label: "Chưa match" },
  { value: "da_match", label: "Đã match" },
  { value: "khong_match", label: "Không match được" },
];

export default function AdminRequestsPage() {
  const { error: showError, success: showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [matchingFilter, setMatchingFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRequestForm>(initialCreateForm);
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null);
  const [updatePriority, setUpdatePriority] = useState("trung_binh");
  const [updateStatus, setUpdateStatus] = useState("cho_xu_ly");
  const [createLocation, setCreateLocation] = useState<Coordinates | null>(null);
  const [updateLocation, setUpdateLocation] = useState<Coordinates | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateLocationWarning, setUpdateLocationWarning] = useState<string | null>(null);
  const [isUpdateGeocoding, setIsUpdateGeocoding] = useState(false);
  const [updateDiaChi, setUpdateDiaChi] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<WorkflowRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Use real workflow hooks
  const approveRequestMutation = useApproveRequest();
  const triggerAutoMatchMutation = useTriggerAutoMatch();

  const normalizeCoord = (
    value: number | string | null | undefined,
  ): number | null => {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Number(numeric.toFixed(6));
  };

  const requestFilters = useMemo(() => {
    const filters: { 
      trang_thai?: string; 
      do_uu_tien?: string;
      trang_thai_phe_duyet?: string;
      trang_thai_matching?: string;
    } = {};
    if (priorityFilter !== "all" && priorityFilter) {
      filters.do_uu_tien = priorityFilter;
    }
    if (statusFilter !== "all" && statusFilter) {
      filters.trang_thai = statusFilter;
    }
    if (approvalFilter !== "all" && approvalFilter) {
      filters.trang_thai_phe_duyet = approvalFilter;
    }
    if (matchingFilter !== "all" && matchingFilter) {
      filters.trang_thai_matching = matchingFilter;
    }
    return Object.keys(filters).length ? filters : undefined;
  }, [priorityFilter, statusFilter, approvalFilter, matchingFilter]);

  const {
    data,
    isLoading,
    refetch,
  } = useRequests(requestFilters);

  const { data: usersData, isLoading: usersLoading } = useUsers();
  const users = useMemo<AdminUser[]>(
    () => (usersData as any)?.users || [],
    [usersData],
  );
  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: String(user.id),
        label: user.ho_va_ten || user.email || `Người dùng #${user.id}`,
      })),
    [users],
  );

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === selectedUserId) || null,
    [users, selectedUserId],
  );

  useEffect(() => {
    if (isCreateModalOpen && !selectedUserId && userOptions.length > 0) {
      setSelectedUserId(userOptions[0].value);
    }
  }, [isCreateModalOpen, selectedUserId, userOptions]);

  const requests = useMemo(
    () => ((data as any)?.requests || []) as WorkflowRequest[],
    [data],
  );

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const fields = [
        request.loai_yeu_cau,
        request.mo_ta,
        request.nguoi_dung?.ho_va_ten,
        request.nguoi_dung?.email,
        request.nguoi_dung?.so_dien_thoai,
        translatePriority(request.do_uu_tien),
        translateRequestStatus(request.trang_thai),
      ];

      return fields.some((field) =>
        field?.toString().toLowerCase().includes(normalizedQuery),
      );
    });
  }, [requests, searchQuery]);

  const stats = useMemo(() => {
    const total = requests.length;
    const urgent = requests.filter((req) => req.do_uu_tien === "cao").length;
    const inProgress = requests.filter((req) => req.trang_thai === "dang_xu_ly").length;
    const completed = requests.filter((req) => req.trang_thai === "hoan_thanh").length;
    const pendingApproval = requests.filter((req) => req.trang_thai_phe_duyet === "cho_phe_duyet").length;
    const approved = requests.filter((req) => req.trang_thai_phe_duyet === "da_phe_duyet").length;
    const matched = requests.filter((req) => req.trang_thai_matching === "da_match").length;
    const avgPriorityScore = requests.length > 0 
      ? Math.round(requests.reduce((sum, req) => sum + (req.diem_uu_tien || 0), 0) / requests.length)
      : 0;

    return {
      total,
      urgent,
      inProgress,
      completed,
      pendingApproval,
      approved,
      matched,
      avgPriorityScore,
    };
  }, [requests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, statusFilter, approvalFilter, matchingFilter]);

  useEffect(() => {
    if (selectedRequest) {
      setUpdatePriority(selectedRequest.do_uu_tien || "trung_binh");
      setUpdateStatus(selectedRequest.trang_thai || "cho_xu_ly");
    } else {
      setUpdatePriority("trung_binh");
      setUpdateStatus("cho_xu_ly");
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (
      selectedRequest &&
      selectedRequest.vi_do !== null &&
      selectedRequest.vi_do !== undefined &&
      selectedRequest.kinh_do !== null &&
      selectedRequest.kinh_do !== undefined
    ) {
      const lat = Number(selectedRequest.vi_do);
      const lng = Number(selectedRequest.kinh_do);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setUpdateLocation({ lat, lng });
        return;
      }
    }
    setUpdateLocation(null);
  }, [selectedRequest]);

  useEffect(() => {
    if (!selectedRequest) return;
    const latest = requests.find((req) => req.id === selectedRequest.id);
    if (latest && latest !== selectedRequest) {
      setSelectedRequest(latest);
    }
  }, [requests, selectedRequest]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRequests.length / pageSize)),
    [filteredRequests.length, pageSize],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const createRequestMutation = useCreateRequest();
  const updateRequestMutation = useUpdateRequest(selectedRequest?.id ?? 0);

  const handleOpenCreateModal = () => {
    setCreateForm(initialCreateForm);
    setCreateLocation(null);
    setCreateError(null);
    setLocationWarning(null);
    setSelectedUserId("");
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateForm(initialCreateForm);
    setCreateLocation(null);
    setCreateError(null);
    setLocationWarning(null);
    setSelectedUserId("");
  };

  const handleCreateFormChange = (key: keyof CreateRequestForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateLocationChange = async (coords: Coordinates | null) => {
    setCreateLocation(coords);
    setCreateForm((prev) => ({
      ...prev,
      vi_do: coords ? coords.lat.toString() : "",
      kinh_do: coords ? coords.lng.toString() : "",
    }));
    
    // Clear previous warnings and address
    setLocationWarning(null);
    
    if (!coords) {
      // Clear address when location is removed
      setCreateForm((prev) => ({ ...prev, dia_chi: "" }));
      return;
    }
    
    // Check if coordinates are outside Vietnam bounds
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
        // Auto-fill address
        setCreateForm((prev) => ({ ...prev, dia_chi: address }));
      }
      
      // Check country from geocoding API (MORE ACCURATE than bounds check)
      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");
      
      console.log("🌍 Geocoding country result:", country, "isVietnam:", isVietnamCountry);
      
      // Update warning based on ACTUAL country from API
      if (country && !isVietnamCountry) {
        setLocationWarning(`⚠️ Không phải lãnh thổ Việt Nam (${country})`);
      } else if (!isVietnamCountry && !isInVietnam) {
        // Both bounds and country check failed
        setLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
      } else if (isVietnamCountry && !isInVietnam) {
        // Country check says Vietnam but bounds check says no - trust country more
        console.log("⚠️ Bounds check failed but country is Vietnam - allowing");
        setLocationWarning(null);
      }
    } catch (error) {
      console.error("Error geocoding:", error);
      // If geocoding fails, rely on bounds check
      if (!isInVietnam) {
        setLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
      }
    } finally {
      setIsGeocoding(false);
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
    console.log("🔍 Validating create location:", createLocation.lat, createLocation.lng);
    
    // First check bounds (quick validation)
    const coordValidation = validateCoordinates(
      createLocation.lat,
      createLocation.lng,
      true // Yêu cầu tọa độ trong phạm vi Việt Nam
    );
    
    console.log("📊 Create validation result:", coordValidation);
    
    if (!coordValidation.isValid) {
      console.log("❌ Create validation failed:", coordValidation.error);
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
      
      console.log("🌍 Geocoding country result:", country, "isVietnam:", isVietnamCountry);
      
      if (!isVietnamCountry) {
        console.log("🚫 BLOCKING: Country is not Vietnam:", country);
        showError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        setCreateError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        return;
      }
    } catch (error) {
      console.error("❌ Error checking country:", error);
      // If geocoding fails, fall back to bounds check
      const isInVietnam = isWithinVietnamBounds(createLocation.lat, createLocation.lng);
      if (!isInVietnam) {
        console.log("🚫 BLOCKING: Location outside Vietnam bounds (geocoding failed)");
        showError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        setCreateError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        return;
      }
      // If bounds check passes but geocoding failed, warn but allow (to avoid blocking valid requests)
      console.log("⚠️ Geocoding failed but bounds check passed - allowing with warning");
    }
    
    console.log("✅ Create validation passed - location is in Vietnam");
    if (!selectedUserId) {
      showError("Vui lòng chọn người gửi yêu cầu.");
      setCreateError("Vui lòng chọn người gửi yêu cầu.");
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
        trang_thai: createForm.trang_thai,
        vi_do: createLocation.lat,
        kinh_do: createLocation.lng,
        id_nguoi_dung: Number(selectedUserId),
      },
      {
        onSuccess: () => {
          showSuccess("Tạo yêu cầu cứu trợ thành công!");
          setTimeout(() => {
            setCreateForm(initialCreateForm);
            setCreateLocation(null);
            setCreateError(null);
            setLocationWarning(null);
            setSelectedUserId("");
            setIsCreateModalOpen(false);
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

  const handleOpenDetail = (request: WorkflowRequest) => {
    setSelectedRequest(request);
    setUpdateError(null);
    setUpdateLocationWarning(null);
    setUpdateDiaChi((request as any).dia_chi || "");
    if (
      request.vi_do !== null &&
      request.vi_do !== undefined &&
      request.kinh_do !== null &&
      request.kinh_do !== undefined
    ) {
      const lat = Number(request.vi_do);
      const lng = Number(request.kinh_do);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setUpdateLocation({ lat, lng });
        // Check if current location is in Vietnam
        if (!isWithinVietnamBounds(lat, lng)) {
          setUpdateLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
        }
      } else {
        setUpdateLocation(null);
      }
    } else {
      setUpdateLocation(null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedRequest(null);
    setUpdateLocation(null);
    setUpdateError(null);
    setUpdateLocationWarning(null);
    setUpdateDiaChi("");
  };

  const handleUpdateLocationChange = async (coords: Coordinates | null) => {
    setUpdateLocation(coords);
    setUpdateLocationWarning(null);
    
    if (!coords) {
      setUpdateDiaChi("");
      return;
    }
    
    // Check if coordinates are outside Vietnam bounds
    const isInVietnam = isWithinVietnamBounds(coords.lat, coords.lng);
    
    if (!isInVietnam) {
      setUpdateLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
    }
    
    // Reverse geocode to get address
    setIsUpdateGeocoding(true);
    try {
      const { address, country } = await reverseGeocodeWithCountry(
        coords.lat,
        coords.lng
      );
      
      if (address) {
        // Auto-fill address
        setUpdateDiaChi(address);
      }
      
      // Update warning if country is not Vietnam
      if (country && country.toLowerCase() !== "việt nam" && country.toLowerCase() !== "vietnam") {
        setUpdateLocationWarning(`⚠️ Không phải lãnh thổ Việt Nam (${country})`);
      } else if (!isInVietnam) {
        setUpdateLocationWarning("⚠️ Không phải lãnh thổ Việt Nam");
      }
    } catch (error) {
      console.error("Error geocoding:", error);
    } finally {
      setIsUpdateGeocoding(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    const originalLat = normalizeCoord(selectedRequest.vi_do);
    const originalLng = normalizeCoord(selectedRequest.kinh_do);
    const updatedLat = normalizeCoord(updateLocation?.lat ?? null);
    const updatedLng = normalizeCoord(updateLocation?.lng ?? null);

    const locationChanged =
      originalLat !== updatedLat || originalLng !== updatedLng;

    // ALWAYS validate location must be in Vietnam
    // If location changed, validate new location. If not changed, validate existing location.
    const locationToValidate = updateLocation ?? 
      (selectedRequest.vi_do !== null && selectedRequest.vi_do !== undefined && 
       selectedRequest.kinh_do !== null && selectedRequest.kinh_do !== undefined
        ? { lat: Number(selectedRequest.vi_do), lng: Number(selectedRequest.kinh_do) }
        : null);
    
    console.log("🔍 Validating update location:", locationToValidate, "original:", selectedRequest.vi_do, selectedRequest.kinh_do);
    
    // Location is REQUIRED and must be in Vietnam
    if (!locationToValidate) {
      console.log("❌ Update validation failed: No location");
      showError("Yêu cầu phải có vị trí hợp lệ trong lãnh thổ Việt Nam.");
      setUpdateError("Yêu cầu phải có vị trí hợp lệ trong lãnh thổ Việt Nam.");
      return;
    }
    
    // Validate coordinates using reverse geocoding API (MOST ACCURATE)
    const coordValidation = validateCoordinates(
      locationToValidate.lat,
      locationToValidate.lng,
      true // Yêu cầu tọa độ trong phạm vi Việt Nam
    );
    
    console.log("📊 Update validation result:", coordValidation);
    
    if (!coordValidation.isValid) {
      console.log("❌ Update validation failed:", coordValidation.error);
      showError(coordValidation.error || "Tọa độ không hợp lệ.");
      setUpdateError(coordValidation.error || "Tọa độ không hợp lệ.");
      return;
    }
    
    // CRITICAL: Use reverse geocoding to check ACTUAL country
    try {
      const { reverseGeocodeWithCountry } = await import("@/lib/geocoding");
      const { country } = await reverseGeocodeWithCountry(locationToValidate.lat, locationToValidate.lng);
      
      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");
      
      console.log("🌍 Geocoding country result:", country, "isVietnam:", isVietnamCountry);
      
      if (!isVietnamCountry) {
        console.log("🚫 BLOCKING: Country is not Vietnam:", country);
        showError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        setUpdateError(`Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.`);
        return;
      }
    } catch (error) {
      console.error("❌ Error checking country:", error);
      // If geocoding fails, fall back to bounds check
      const isInVietnam = isWithinVietnamBounds(locationToValidate.lat, locationToValidate.lng);
      if (!isInVietnam) {
        console.log("🚫 BLOCKING: Location outside Vietnam bounds (geocoding failed)");
        showError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        setUpdateError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
        return;
      }
      // If bounds check passes but geocoding failed, warn but allow (to avoid blocking valid requests)
      console.log("⚠️ Geocoding failed but bounds check passed - allowing with warning");
    }
    
    console.log("✅ Update validation passed - location is in Vietnam");

    const hasChanges =
      updatePriority !== selectedRequest.do_uu_tien ||
      updateStatus !== selectedRequest.trang_thai ||
      locationChanged;

    if (!hasChanges) {
      handleCloseDetail();
      return;
    }

    // Always send location (either updated or existing) to ensure backend validation
    const finalLocation = updateLocation ?? 
      (selectedRequest.vi_do !== null && selectedRequest.vi_do !== undefined && 
       selectedRequest.kinh_do !== null && selectedRequest.kinh_do !== undefined
        ? { lat: Number(selectedRequest.vi_do), lng: Number(selectedRequest.kinh_do) }
        : null);

    // Location is REQUIRED - must have valid location
    if (!finalLocation) {
      showError("Yêu cầu phải có vị trí hợp lệ trong lãnh thổ Việt Nam.");
      setUpdateError("Yêu cầu phải có vị trí hợp lệ trong lãnh thổ Việt Nam.");
      return;
    }

    // Final validation before sending to API
    if (!isWithinVietnamBounds(finalLocation.lat, finalLocation.lng)) {
      showError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
      setUpdateError("Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác.");
      return;
    }

    updateRequestMutation.mutate(
      {
        do_uu_tien: updatePriority,
        trang_thai: updateStatus,
        vi_do: finalLocation.lat,
        kinh_do: finalLocation.lng,
        dia_chi: updateDiaChi.trim() || null,
      },
      {
        onSuccess: (data) => {
          if (data?.request) {
            setSelectedRequest(data.request);
          }
          setUpdateError(null);
          showSuccess("✅ Đã cập nhật yêu cầu.");
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Không thể cập nhật yêu cầu.";
          setUpdateError(message);
          showError(message);
        },
      },
    );
  };

  const handleOpenApprovalModal = (request: WorkflowRequest, action: 'approve' | 'reject') => {
    // Kiểm tra request đã được xử lý chưa
    if (request.trang_thai_phe_duyet && request.trang_thai_phe_duyet !== 'cho_phe_duyet') {
      const statusText = translateApprovalStatus(request.trang_thai_phe_duyet);
      showError(`Yêu cầu này đã ${statusText.toLowerCase()} rồi.`);
      return;
    }
    
    setSelectedRequestForApproval(request);
    setApprovalAction(action);
    setRejectionReason("");
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setSelectedRequestForApproval(null);
    setApprovalAction(null);
    setRejectionReason("");
    setIsApprovalModalOpen(false);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedRequestForApproval || !approvalAction) return;

    // Kiểm tra request đã được xử lý chưa
    if (selectedRequestForApproval.trang_thai_phe_duyet !== 'cho_phe_duyet' && 
        selectedRequestForApproval.trang_thai_phe_duyet !== undefined) {
      showError("Yêu cầu này đã được xử lý rồi. Vui lòng tải lại trang.");
      handleCloseApprovalModal();
      await refetch();
      return;
    }

    try {
      if (approvalAction === 'approve') {
        const result = await approveRequestMutation.mutateAsync({
          requestId: selectedRequestForApproval.id,
          data: { approved: true }
        });
        
        // Hiển thị message từ API nếu có
        const message = result?.message || "Đã phê duyệt yêu cầu và kích hoạt auto-matching!";
        showSuccess(message);
      } else {
        if (!rejectionReason.trim()) {
          showError("Vui lòng nhập lý do từ chối");
          return;
        }
        
        const result = await approveRequestMutation.mutateAsync({
          requestId: selectedRequestForApproval.id,
          data: { approved: false, reason: rejectionReason.trim() }
        });
        
        // Hiển thị message từ API nếu có
        const message = result?.message || "Đã từ chối yêu cầu";
        showSuccess(message);
      }
      
      // Đợi refetch xong trước khi đóng modal để đảm bảo data được cập nhật
      await refetch();
      
      // Đóng modal sau khi data đã được refresh
      handleCloseApprovalModal();
      
    } catch (error: any) {
      // Xử lý lỗi chi tiết hơn
      let errorMessage = 'Có lỗi xảy ra khi xử lý phê duyệt';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showError(errorMessage);
      // Không đóng modal khi có lỗi để user có thể thử lại
    }
  };

  const handleTriggerAutoMatch = async (requestId: number) => {
    if (!requestId) {
      showError("Không tìm thấy ID yêu cầu");
      return;
    }

    try {
      const result = await triggerAutoMatchMutation.mutateAsync(requestId);
      
      // Hiển thị message từ API
      const message = result?.message || "Đã kích hoạt auto-matching!";
      
      if (result?.autoMatch) {
        showSuccess(message);
      } else {
        // Không có match - hiển thị warning thay vì error
        showError(message || "Không tìm thấy nguồn lực phù hợp");
      }
      
      await refetch();
    } catch (error: any) {
      console.error('Auto-match error:', error);
      
      let errorMessage = "Có lỗi xảy ra khi kích hoạt auto-matching";
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    }
  };

  const getPriorityScoreColor = (score?: number): BadgeColor => {
    if (!score) return "info";
    if (score >= 80) return "error";
    if (score >= 60) return "warning";
    if (score >= 40) return "warning";
    return "success";
  };

  const getApprovalStatusColor = (status?: ApprovalStatus): BadgeColor => {
    switch (status) {
      case 'da_phe_duyet': return 'success';
      case 'tu_choi': return 'error';
      case 'cho_phe_duyet':
      default: return 'warning';
    }
  };

  const getMatchingStatusColor = (status?: MatchingStatus): BadgeColor => {
    switch (status) {
      case 'da_match': return 'success';
      case 'khong_match': return 'error';
      case 'chua_match':
      default: return 'info';
    }
  };

  const getBadgeColorFromString = (color: string): BadgeColor => {
    const colorMap: Record<string, BadgeColor> = {
      'green': 'success',
      'red': 'error',
      'orange': 'warning',
      'yellow': 'warning',
      'blue': 'primary',
      'gray': 'light',
      'grey': 'light',
    };
    return colorMap[color] || 'info';
  };

  const originalLatForComparison = normalizeCoord(selectedRequest?.vi_do);
  const originalLngForComparison = normalizeCoord(selectedRequest?.kinh_do);
  const updatedLatForComparison = normalizeCoord(updateLocation?.lat ?? null);
  const updatedLngForComparison = normalizeCoord(updateLocation?.lng ?? null);
  const locationChangedForComparison =
    selectedRequest !== null &&
    (originalLatForComparison !== updatedLatForComparison ||
      originalLngForComparison !== updatedLngForComparison);

  const hasUpdateChanges =
    !!selectedRequest &&
    (updatePriority !== selectedRequest.do_uu_tien ||
      updateStatus !== selectedRequest.trang_thai ||
      locationChangedForComparison);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredRequests, pageSize]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Mã yêu cầu",
        render: (value: number) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            #{value}
          </span>
        ),
      },
      {
        key: "loai_yeu_cau",
        label: "Loại yêu cầu",
        render: (_: string, row: WorkflowRequest) => (
          <div className="max-w-xs space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.loai_yeu_cau}
            </p>
            {row.mo_ta && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {row.mo_ta}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "nguoi_dung",
        label: "Người gửi",
        render: (_: ReliefUser, row: WorkflowRequest) => (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.nguoi_dung?.ho_va_ten || "Không xác định"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.nguoi_dung?.email || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "diem_uu_tien",
        label: "Điểm ưu tiên",
        render: (value: number, row: WorkflowRequest) => (
          <div className="space-y-1">
            <Badge color={getPriorityScoreColor(value)} size="sm">
              {value || 0}/100
            </Badge>
            <Badge color={getBadgeColorFromString(getPriorityColor(row.do_uu_tien))} size="sm">
              {translatePriority(row.do_uu_tien)}
            </Badge>
          </div>
        ),
      },
      {
        key: "trang_thai_phe_duyet",
        label: "Phê duyệt",
        render: (value: ApprovalStatus, row: WorkflowRequest) => (
          <div className="space-y-1">
            <Badge color={getApprovalStatusColor(value)} size="sm">
              {translateApprovalStatus(value)}
            </Badge>
            {(value === 'cho_phe_duyet' || !value) && (
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenApprovalModal(row, 'approve')}
                  disabled={approveRequestMutation.isPending || row.trang_thai_phe_duyet !== 'cho_phe_duyet'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-green-300 text-green-700 bg-white hover:bg-green-50 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-800 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:border-green-600"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Duyệt</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenApprovalModal(row, 'reject')}
                  disabled={approveRequestMutation.isPending || row.trang_thai_phe_duyet !== 'cho_phe_duyet'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-800 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-600"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Từ chối</span>
                </button>
              </div>
            )}
          </div>
        ),
      },
      {
        key: "trang_thai_matching",
        label: "Auto-Match",
        render: (value: MatchingStatus, row: WorkflowRequest) => (
          <div className="space-y-1">
            <Badge color={getMatchingStatusColor(value)} size="sm">
              {value === 'da_match' ? 'Matched' : 
               value === 'khong_match' ? 'No match' : 'Pending'}
            </Badge>
            {row.nguon_luc_match && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.nguon_luc_match.ten_nguon_luc}
              </p>
            )}
            {row.khoang_cach_gan_nhat && typeof row.khoang_cach_gan_nhat === 'number' && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {row.khoang_cach_gan_nhat.toFixed(1)}km
              </p>
            )}
            {row.trang_thai_phe_duyet === 'da_phe_duyet' && value === 'chua_match' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTriggerAutoMatch(row.id)}
                className="text-blue-600 hover:bg-blue-50"
                disabled={triggerAutoMatchMutation.isPending}
              >
                Re-match
              </Button>
            )}
          </div>
        ),
      },
      {
        key: "trang_thai",
        label: "Trạng thái",
        render: (value: string) => (
          <Badge color={getBadgeColorFromString(getRequestStatusColor(value))} size="sm">
            {translateRequestStatus(value)}
          </Badge>
        ),
      },
      {
        key: "so_nguoi",
        label: "Số người",
        render: (value: number) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {value?.toLocaleString?.() ?? value}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "Ngày tạo",
        render: (value: string) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {format(new Date(value), "dd/MM/yyyy HH:mm")}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: WorkflowRequest) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenDetail(row)}
            startIcon={<Eye className="w-4 h-4" />}
          >
            Chi tiết
          </Button>
        ),
      },
    ],
    [approveRequestMutation.isPending, triggerAutoMatchMutation.isPending],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu cứu trợ"
        description="Phê duyệt, auto-matching và theo dõi các yêu cầu cứu trợ trong hệ thống"
        showAddButton
        addButtonText="Thêm yêu cầu"
        onAdd={handleOpenCreateModal}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 xl:grid-cols-8">
        <AdminStatsCard
          title="Tổng yêu cầu"
          value={stats.total}
          icon={LifeBuoy}
          color="blue"
          description="Tất cả yêu cầu đang theo dõi"
        />
        <AdminStatsCard
          title="Chờ phê duyệt"
          value={stats.pendingApproval}
          icon={Timer}
          color="orange"
          description="Cần xử lý ngay"
        />
        <AdminStatsCard
          title="Đã phê duyệt"
          value={stats.approved}
          icon={CheckCircle}
          color="green"
          description="Đã được chấp thuận"
        />
        <AdminStatsCard
          title="Auto-matched"
          value={stats.matched}
          icon={Target}
          color="purple"
          description="Đã match nguồn lực"
        />
        <AdminStatsCard
          title="Ưu tiên cao"
          value={stats.urgent}
          icon={AlertTriangle}
          color="red"
          description="Cần xử lý khẩn cấp"
        />
        <AdminStatsCard
          title="Đang xử lý"
          value={stats.inProgress}
          icon={Clock}
          color="yellow"
          description="Đang điều phối"
        />
        <AdminStatsCard
          title="Điểm ưu tiên TB"
          value={stats.avgPriorityScore}
          icon={Zap}
          color="indigo"
          description="Trung bình hệ thống"
        />
        <AdminStatsCard
          title="Hoàn thành"
          value={stats.completed}
          icon={CheckCircle2}
          color="green"
          description="Đã giải quyết"
        />
      </div>

      {isLoading ? (
        <AdminLoading
          variant="section"
          label="Đang tải danh sách yêu cầu..."
          className="min-h-[320px]"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={paginatedRequests}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Tìm kiếm theo yêu cầu, người gửi, mô tả..."
          onSearch={setSearchQuery}
          filters={[
            {
              key: "approval",
              label: "Lọc theo phê duyệt",
              options: [
                { value: "all", label: "Tất cả trạng thái phê duyệt" },
                ...approvalStatusOptions,
              ],
              onChange: (value) => setApprovalFilter(value === "all" ? "all" : value),
            },
            {
              key: "matching",
              label: "Lọc theo matching",
              options: [
                { value: "all", label: "Tất cả trạng thái matching" },
                ...matchingStatusOptions,
              ],
              onChange: (value) => setMatchingFilter(value === "all" ? "all" : value),
            },
            {
              key: "priority",
              label: "Lọc theo ưu tiên",
              options: [
                { value: "all", label: "Tất cả mức ưu tiên" },
                ...prioritySelectOptions,
              ],
              onChange: (value) => setPriorityFilter(value === "all" ? "all" : value),
            },
            {
              key: "status",
              label: "Lọc theo trạng thái",
              options: [
                { value: "all", label: "Tất cả trạng thái" },
                ...statusSelectOptions,
              ],
              onChange: (value) => setStatusFilter(value === "all" ? "all" : value),
            },
          ]}
          toolbarActions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              startIcon={<RefreshCcw className="w-4 h-4" />}
            >
              Tải lại
            </Button>
          }
          emptyMessage="Không có yêu cầu nào"
          emptyDescription="Hiện chưa có yêu cầu phù hợp với bộ lọc."
          emptyIcon={<FileText className="h-5 w-5" />}
        />
      )}

      {!isLoading && filteredRequests.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60 md:flex-row">
          <span className="text-gray-600 dark:text-gray-300">
            Hiển thị {paginatedRequests.length} / {filteredRequests.length} yêu cầu
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              startIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Trước
            </Button>
            <span className="text-gray-600 dark:text-gray-300">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              endIcon={<ChevronRight className="h-4 w-4" />}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <AdminModal
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        title={
          approvalAction === 'approve' 
            ? `Phê duyệt yêu cầu #${selectedRequestForApproval?.id}`
            : `Từ chối yêu cầu #${selectedRequestForApproval?.id}`
        }
        description={
          approvalAction === 'approve'
            ? "Phê duyệt yêu cầu sẽ kích hoạt auto-matching với nguồn lực phù hợp"
            : "Vui lòng nhập lý do từ chối để thông báo cho người gửi"
        }
        size="md"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={handleCloseApprovalModal}
              disabled={approveRequestMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              disabled={
                approveRequestMutation.isPending || 
                !selectedRequestForApproval ||
                (approvalAction === 'reject' && !rejectionReason.trim())
              }
              variant={approvalAction === 'approve' ? 'primary' : 'outline'}
              className={approvalAction === 'reject' ? 'text-red-600 border-red-600 hover:bg-red-50' : ''}
            >
              {approveRequestMutation.isPending 
                ? "Đang xử lý..." 
                : approvalAction === 'approve' ? "Phê duyệt" : "Từ chối"}
            </Button>
          </>
        }
      >
        {selectedRequestForApproval && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {selectedRequestForApproval.loai_yeu_cau}
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Người gửi: {selectedRequestForApproval.nguoi_dung?.ho_va_ten || "Không xác định"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Số người ảnh hưởng: {selectedRequestForApproval.so_nguoi.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Điểm ưu tiên: {selectedRequestForApproval.diem_uu_tien || 0}/100
              </p>
            </div>

            {approvalAction === 'reject' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lý do từ chối *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  placeholder="Nhập lý do từ chối yêu cầu này..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lý do này sẽ được gửi thông báo cho người tạo yêu cầu
                </p>
              </div>
            )}

            {approvalAction === 'approve' && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium">Phê duyệt sẽ kích hoạt:</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      <li>Auto-matching với nguồn lực phù hợp</li>
                      <li>Thông báo cho người gửi yêu cầu</li>
                      <li>Cập nhật trạng thái thành "Đã phê duyệt"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Thêm yêu cầu cứu trợ mới"
        description="Nhập thông tin yêu cầu theo dữ liệu của hệ thống"
        size="lg"
        className="max-h-[90vh]"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseCreateModal}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateRequest}
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? "Đang tạo..." : "Tạo yêu cầu"}
            </Button>
          </>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {createError && (
            <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
              {createError}
            </div>
          )}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Loại yêu cầu
            </label>
            <Input
              value={createForm.loai_yeu_cau}
              onChange={(e) => handleCreateFormChange("loai_yeu_cau", e.target.value)}
              placeholder="Ví dụ: Thực phẩm khẩn cấp"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Người gửi yêu cầu
            </label>
            <Select
              key={`create-user-${selectedUserId || "none"}`}
              options={
                userOptions.length > 0
                  ? userOptions
                  : [{ value: "", label: usersLoading ? "Đang tải..." : "Chưa có dữ liệu" }]
              }
              placeholder="Chọn người gửi"
              defaultValue={selectedUserId}
              onChange={(value) => setSelectedUserId(value)}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {selectedUser
                ? `Đang chọn: ${selectedUser.ho_va_ten || selectedUser.email || `Người dùng #${selectedUser.id}`}`
                : "Chưa chọn người gửi"}
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Số người ảnh hưởng
            </label>
            <Input
              type="number"
              value={createForm.so_nguoi}
              onChange={(e) => handleCreateFormChange("so_nguoi", e.target.value)}
              placeholder="Nhập số người"
              min="1"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ưu tiên
            </label>
            <Select
              key={`create-priority-${createForm.do_uu_tien}`}
              options={prioritySelectOptions}
              placeholder="Chọn mức ưu tiên"
              defaultValue={createForm.do_uu_tien}
              onChange={(value) => handleCreateFormChange("do_uu_tien", value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Trạng thái
            </label>
            <Select
              key={`create-status-${createForm.trang_thai}`}
              options={statusSelectOptions}
              placeholder="Chọn trạng thái"
              defaultValue={createForm.trang_thai}
              onChange={(value) => handleCreateFormChange("trang_thai", value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Địa chỉ <span className="text-xs text-gray-500 dark:text-gray-400">(tùy chọn - tự động điền khi chọn vị trí)</span>
            </label>
            <div className="relative">
              <Input
                value={createForm.dia_chi}
                onChange={(e) => handleCreateFormChange("dia_chi", e.target.value)}
                placeholder="Sẽ tự động điền khi bạn chọn vị trí trên bản đồ..."
                disabled={isGeocoding}
                className={isGeocoding ? "opacity-50" : ""}
              />
              {isGeocoding && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <RefreshCcw className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {isGeocoding 
                ? "Đang tìm địa chỉ..." 
                : "Địa chỉ sẽ tự động điền khi bạn chọn vị trí trên bản đồ. Bạn có thể chỉnh sửa nếu cần."}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mô tả chi tiết
            </label>
            <textarea
              value={createForm.mo_ta}
              onChange={(e) => handleCreateFormChange("mo_ta", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Nhập mô tả ngắn gọn về tình hình cần cứu trợ..."
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vị trí trên bản đồ
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Nhấp vào bản đồ bên dưới để chọn vị trí chính xác
              </span>
            </div>
            <MapLocationPicker
              value={createLocation}
              onChange={handleCreateLocationChange}
              isActive={isCreateModalOpen}
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {createLocation
                    ? `Vị trí đã chọn: ${createLocation.lat.toFixed(4)}, ${createLocation.lng.toFixed(4)}`
                    : "Chưa chọn vị trí"}
                </span>
                {createLocation && (
                  <button
                    type="button"
                    onClick={() => handleCreateLocationChange(null)}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Xóa vị trí
                  </button>
                )}
              </div>
              {locationWarning && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>{locationWarning}</p>
                  </div>
                </div>
              )}
              {createLocation && !locationWarning && !isGeocoding && (
                <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>✓ Tọa độ nằm trong phạm vi Việt Nam</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={Boolean(selectedRequest)}
        onClose={handleCloseDetail}
        title={
          selectedRequest
            ? `Chi tiết yêu cầu #${selectedRequest.id}`
            : "Chi tiết yêu cầu"
        }
        description={
          selectedRequest?.loai_yeu_cau
            ? `Loại yêu cầu: ${selectedRequest.loai_yeu_cau}`
            : undefined
        }
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseDetail}>
              Đóng
            </Button>
            <Button
              onClick={handleUpdateRequest}
              disabled={updateRequestMutation.isPending || !hasUpdateChanges}
            >
              {updateRequestMutation.isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
            {updateError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                {updateError}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={getBadgeColorFromString(getPriorityColor(selectedRequest.do_uu_tien))} size="sm">
                Ưu tiên: {translatePriority(selectedRequest.do_uu_tien)}
              </Badge>
              <Badge color={getBadgeColorFromString(getRequestStatusColor(selectedRequest.trang_thai))} size="sm">
                Trạng thái: {translateRequestStatus(selectedRequest.trang_thai)}
              </Badge>
              <Badge color={getApprovalStatusColor(selectedRequest.trang_thai_phe_duyet)} size="sm">
                {translateApprovalStatus(selectedRequest.trang_thai_phe_duyet)}
              </Badge>
              {selectedRequest.diem_uu_tien && (
                <Badge color={getPriorityScoreColor(selectedRequest.diem_uu_tien)} size="sm">
                  Điểm: {selectedRequest.diem_uu_tien}/100
                </Badge>
              )}
              {selectedRequest.trang_thai_matching && (
                <Badge color={getMatchingStatusColor(selectedRequest.trang_thai_matching)} size="sm">
                  {translateMatchingStatus(selectedRequest.trang_thai_matching)}
                </Badge>
              )}
              <Badge color="info" size="sm">
                {selectedRequest.phan_phois?.length || 0} phân phối liên quan
              </Badge>
            </div>

            <div className="grid grid-cols-12 gap-4 md:grid-cols-6 lg:grid-cols-4">
            <div className="space-y-4 lg:col-span-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thông tin người liên hệ
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">
                          {selectedRequest.nguoi_dung?.ho_va_ten || "Không xác định"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Người tạo yêu cầu
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p>{selectedRequest.nguoi_dung?.email || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Số điện thoại
                      </p>
                      <p>{selectedRequest.nguoi_dung?.so_dien_thoai || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 lg:col-span-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thông tin yêu cầu
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mô tả
                      </p>
                      <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                        {selectedRequest.mo_ta || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Số người ảnh hưởng
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedRequest.so_nguoi.toLocaleString()}
                      </p>
                    </div>
                    {(selectedRequest as any).dia_chi && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Địa chỉ
                        </p>
                        <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                          {(selectedRequest as any).dia_chi}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ngày tạo
                      </p>
                      <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                        {format(new Date(selectedRequest.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vị trí
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>
                          {updateLocation
                            ? `${updateLocation.lat.toFixed(4)}, ${updateLocation.lng.toFixed(4)}`
                            : selectedRequest.vi_do !== null &&
                              selectedRequest.vi_do !== undefined &&
                              selectedRequest.kinh_do !== null &&
                              selectedRequest.kinh_do !== undefined
                            ? `${Number(selectedRequest.vi_do).toFixed(4)}, ${Number(selectedRequest.kinh_do).toFixed(4)}`
                            : "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Vị trí trên bản đồ
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Địa chỉ <span className="text-xs text-gray-500 dark:text-gray-400">(tự động điền khi chọn vị trí)</span>
                      </label>
                      <div className="relative">
                        <Input
                          value={updateDiaChi}
                          onChange={(e) => setUpdateDiaChi(e.target.value)}
                          placeholder="Sẽ tự động điền khi bạn chọn vị trí trên bản đồ..."
                          disabled={isUpdateGeocoding}
                          className={isUpdateGeocoding ? "opacity-50" : ""}
                        />
                        {isUpdateGeocoding && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <RefreshCcw className="h-4 w-4 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {isUpdateGeocoding 
                          ? "Đang tìm địa chỉ..." 
                          : "Địa chỉ sẽ tự động điền khi bạn chọn vị trí trên bản đồ. Bạn có thể chỉnh sửa nếu cần."}
                      </p>
                    </div>
                    <MapLocationPicker
                      value={updateLocation}
                      onChange={handleUpdateLocationChange}
                      isActive={Boolean(selectedRequest)}
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>
                          {updateLocation
                            ? `Vĩ độ: ${updateLocation.lat.toFixed(4)}, Kinh độ: ${updateLocation.lng.toFixed(4)}`
                            : "Chưa chọn vị trí"}
                        </span>
                        {updateLocation && (
                          <button
                            type="button"
                            onClick={() => handleUpdateLocationChange(null)}
                            className="text-xs font-medium text-red-500 hover:underline"
                          >
                            Xóa vị trí
                          </button>
                        )}
                      </div>
                      {updateLocationWarning && (
                        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p>{updateLocationWarning}</p>
                          </div>
                        </div>
                      )}
                      {updateLocation && !updateLocationWarning && !isUpdateGeocoding && (
                        <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p>✓ Tọa độ nằm trong phạm vi Việt Nam</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cập nhật xử lý
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ưu tiên
                      </label>
                      <Select
                        key={`detail-priority-${selectedRequest.id}-${updatePriority}`}
                        options={prioritySelectOptions}
                        placeholder="Chọn ưu tiên"
                        defaultValue={updatePriority}
                        onChange={(value) => setUpdatePriority(value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trạng thái
                      </label>
                      <Select
                        key={`detail-status-${selectedRequest.id}-${updateStatus}`}
                        options={statusSelectOptions}
                        placeholder="Chọn trạng thái"
                        defaultValue={updateStatus}
                        onChange={(value) => setUpdateStatus(value)}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Lưu ý: Cập nhật ưu tiên, trạng thái và vị trí sẽ hiển thị ngay trong bảng quản trị và bản đồ cứu trợ.
                  </p>
                </div>

                {/* Thông tin Auto-Match */}
                {(selectedRequest.trang_thai_phe_duyet === 'da_phe_duyet' || selectedRequest.nguon_luc_match) && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Thông tin Auto-Matching
                    </h3>
                    <div className="mt-4 space-y-4">
                      {/* Trạng thái matching */}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Trạng thái matching
                        </p>
                        <Badge 
                          color={getMatchingStatusColor(selectedRequest.trang_thai_matching)} 
                          size="sm"
                        >
                          {selectedRequest.trang_thai_matching === 'da_match' ? '✅ Đã match với nguồn lực' : 
                           selectedRequest.trang_thai_matching === 'khong_match' ? '❌ Không tìm thấy nguồn lực phù hợp' : 
                           '⏳ ' + translateMatchingStatus(selectedRequest.trang_thai_matching)}
                        </Badge>
                      </div>

                      {/* Thông tin nguồn lực đã match */}
                      {selectedRequest.nguon_luc_match && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                                Nguồn lực đã match
                              </p>
                              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                {selectedRequest.nguon_luc_match.ten_nguon_luc}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  Loại
                                </p>
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  {selectedRequest.nguon_luc_match.loai || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  Số lượng khả dụng
                                </p>
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  {selectedRequest.nguon_luc_match.so_luong?.toLocaleString() || "—"} {selectedRequest.nguon_luc_match.don_vi || ""}
                                </p>
                              </div>
                            </div>
                            {selectedRequest.nguon_luc_match.trung_tam && (
                              <>
                                <div>
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    Trung tâm cứu trợ
                                  </p>
                                  <p className="font-medium text-green-900 dark:text-green-100">
                                    {selectedRequest.nguon_luc_match.trung_tam.ten_trung_tam || "—"}
                                  </p>
                                  {selectedRequest.nguon_luc_match.trung_tam.dia_chi && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                      {selectedRequest.nguon_luc_match.trung_tam.dia_chi}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                            {selectedRequest.khoang_cach_gan_nhat && typeof selectedRequest.khoang_cach_gan_nhat === 'number' && (
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  Khoảng cách
                                </p>
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  {selectedRequest.khoang_cach_gan_nhat.toFixed(1)} km
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Thông tin phê duyệt */}
                      {selectedRequest.nguoi_phe_duyet && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Người phê duyệt
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {selectedRequest.nguoi_phe_duyet.ho_va_ten || "—"}
                          </p>
                          {selectedRequest.thoi_gian_phe_duyet && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {format(new Date(selectedRequest.thoi_gian_phe_duyet), "dd/MM/yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Lý do từ chối nếu có */}
                      {selectedRequest.trang_thai_phe_duyet === 'tu_choi' && selectedRequest.ly_do_tu_choi && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                          <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                            Lý do từ chối
                          </p>
                          <p className="text-sm text-red-900 dark:text-red-100">
                            {selectedRequest.ly_do_tu_choi}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRequest.phan_phois && selectedRequest.phan_phois.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Phân phối liên quan
                    </h3>
                    <div className="mt-4 space-y-3">
                      {selectedRequest.phan_phois.map((distribution) => (
                        <div
                          key={distribution.id}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-white/[0.04] dark:bg-white/[0.02]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                Phân phối #{distribution.id}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Nguồn lực:{" "}
                                {distribution.nguon_luc?.ten_nguon_luc || "Chưa cập nhật"}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Tình nguyện viên:{" "}
                                {distribution.tinh_nguyen_vien?.ho_va_ten || "Chưa phân công"}
                              </p>
                            </div>
                            <Badge color="info" size="sm">
                              {translateDistributionStatus(distribution.trang_thai)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
