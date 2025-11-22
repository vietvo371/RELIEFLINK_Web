import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { RequestWorkflowService } from "@/lib/requestWorkflow";
import { NotificationService } from "@/lib/notificationService";

// GET /api/requests - Get all relief requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trang_thai = searchParams.get("trang_thai");
    const do_uu_tien = searchParams.get("do_uu_tien");
    const trang_thai_phe_duyet = searchParams.get("trang_thai_phe_duyet");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};
    if (trang_thai) where.trang_thai = trang_thai;
    if (do_uu_tien) where.do_uu_tien = do_uu_tien;
    if (trang_thai_phe_duyet) where.trang_thai_phe_duyet = trang_thai_phe_duyet;

    // Sắp xếp theo priority score nếu được chọn
    const orderBy: any = {};
    if (sortBy === "priority") {
      orderBy.diem_uu_tien = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const requests = await prisma.yeu_cau_cuu_tros.findMany({
      where,
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_va_ten: true,
            email: true,
            so_dien_thoai: true,
          },
        },
        nguoi_phe_duyet: {
          select: {
            ho_va_ten: true,
            vai_tro: true,
          },
        },
        nguon_luc_match: {
          include: {
            trung_tam: {
              select: {
                ten_trung_tam: true,
                dia_chi: true,
              },
            },
          },
        },
        phan_phois: {
          include: {
            nguon_luc: true,
            tinh_nguyen_vien: {
              select: {
                ho_va_ten: true,
              },
            },
          },
        },
      },
      orderBy,
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách yêu cầu" },
      { status: 500 },
    );
  }
}

// POST /api/requests - Create new relief request
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      loai_yeu_cau,
      mo_ta,
      dia_chi,
      so_nguoi,
      do_uu_tien,
      vi_do,
      kinh_do,
      trang_thai,
      id_nguoi_dung,
    } = body;

    const targetUserIdRaw =
      id_nguoi_dung !== undefined && id_nguoi_dung !== null
        ? Number(id_nguoi_dung)
        : payload.userId;

    if (!targetUserIdRaw || Number.isNaN(targetUserIdRaw)) {
      return NextResponse.json(
        { error: "Thiếu thông tin người gửi yêu cầu" },
        { status: 400 },
      );
    }

    const parsedPeople = Number(so_nguoi);
    if (!Number.isFinite(parsedPeople) || parsedPeople <= 0) {
      return NextResponse.json(
        { error: "Số người ảnh hưởng không hợp lệ" },
        { status: 400 },
      );
    }

    // Validate coordinates - REQUIRE Vietnam bounds (MANDATORY)
    const parsedLat = vi_do !== null && vi_do !== undefined ? parseFloat(String(vi_do)) : null;
    const parsedLng = kinh_do !== null && kinh_do !== undefined ? parseFloat(String(kinh_do)) : null;
    
    console.log("🔍 [API CREATE] Validating location:", parsedLat, parsedLng);
    
    if (parsedLat === null || parsedLng === null || !Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      console.log("❌ [API CREATE] Location is missing or invalid");
      return NextResponse.json(
        { error: "Vị trí tọa độ là bắt buộc và phải nằm trong lãnh thổ Việt Nam" },
        { status: 400 },
      );
    }
    
    const { validateCoordinates, isWithinVietnamBounds } = await import("@/lib/locationValidation");
    const { reverseGeocodeWithCountry } = await import("@/lib/geocoding");
    
    // First validate global coordinates
    const coordValidation = validateCoordinates(parsedLat, parsedLng, true); // REQUIRE Vietnam bounds
    
    console.log("📊 [API CREATE] Validation result:", coordValidation);
    
    if (!coordValidation.isValid) {
      console.log("❌ [API CREATE] Validation failed:", coordValidation.error);
      return NextResponse.json(
        { error: coordValidation.error || "Tọa độ không hợp lệ" },
        { status: 400 },
      );
    }
    
    // CRITICAL: Use reverse geocoding to check ACTUAL country (MORE ACCURATE than bounds)
    try {
      const { country } = await reverseGeocodeWithCountry(parsedLat, parsedLng);
      
      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");
      
      console.log("🌍 [API CREATE] Geocoding country result:", country, "isVietnam:", isVietnamCountry);
      
      if (!isVietnamCountry) {
        console.log("🚫 [API CREATE] BLOCKING: Country is not Vietnam:", country);
        return NextResponse.json(
          { error: `Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.` },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("❌ [API CREATE] Error checking country:", error);
      // If geocoding fails, fall back to bounds check
      const isInVietnam = isWithinVietnamBounds(parsedLat, parsedLng);
      if (!isInVietnam) {
        console.log("🚫 [API CREATE] BLOCKING: Location outside Vietnam bounds (geocoding failed)");
        return NextResponse.json(
          { error: "Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác." },
          { status: 400 },
        );
      }
      // If bounds check passes but geocoding failed, warn but allow (to avoid blocking valid requests)
      console.log("⚠️ [API CREATE] Geocoding failed but bounds check passed - allowing");
    }
    
    console.log("✅ [API CREATE] Validation passed - creating request");

    const newRequest = await prisma.yeu_cau_cuu_tros.create({
      data: {
        id_nguoi_dung: targetUserIdRaw,
        loai_yeu_cau,
        mo_ta,
        dia_chi: dia_chi && dia_chi.trim() ? dia_chi.trim() : null,
        so_nguoi: parsedPeople,
        do_uu_tien: do_uu_tien || "trung_binh",
        vi_do: parsedLat,
        kinh_do: parsedLng,
        trang_thai: trang_thai || "cho_xu_ly",
        // Workflow mới - mặc định chờ phê duyệt
        trang_thai_phe_duyet: "cho_phe_duyet",
      },
      include: {
        nguoi_dung: {
          select: {
            ho_va_ten: true,
            email: true,
          },
        },
      },
    });

    // Tính toán priority score ban đầu
    try {
      await RequestWorkflowService.updateRequestPriority(newRequest.id);
    } catch (priorityError) {
      console.error("Priority calculation error:", priorityError);
    }

    // Gửi thông báo cho tất cả Admin về yêu cầu mới
    try {
      await NotificationService.notifyNewRequest(newRequest.id, targetUserIdRaw);
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    return NextResponse.json({ 
      request: newRequest,
      message: "Yêu cầu đã được tạo và gửi thông báo cho Admin để phê duyệt"
    }, { status: 201 });

  } catch (error) {
    console.error("Create request error:", error);
    const message =
      error instanceof Error
        ? error.message || "Lỗi khi tạo yêu cầu cứu trợ"
        : "Lỗi khi tạo yêu cầu cứu trợ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
