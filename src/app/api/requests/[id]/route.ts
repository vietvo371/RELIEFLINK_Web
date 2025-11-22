import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/requests/[id] - Get single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const requestData = await prisma.yeu_cau_cuu_tros.findUnique({
      where: { id: parseInt(id) },
      include: {
        nguoi_dung: true,
        phan_phois: {
          include: {
            nguon_luc: true,
            tinh_nguyen_vien: true,
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({ request: requestData }, { status: 200 });
  } catch (error) {
    console.error("Get request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin yêu cầu" },
      { status: 500 },
    );
  }
}

// PUT /api/requests/[id] - Update request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { vi_do, kinh_do } = body;

    // ALWAYS validate location - whether updating or not
    const { validateCoordinates, isWithinVietnamBounds } = await import("@/lib/locationValidation");
    
    // Get existing request to check current location
    const existingRequest = await prisma.yeu_cau_cuu_tros.findUnique({
      where: { id: parseInt(id) },
      select: { vi_do: true, kinh_do: true },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 },
      );
    }

    // Determine which location to validate
    let locationToValidate: { lat: number; lng: number } | null = null;
    
    if (vi_do !== null && vi_do !== undefined && kinh_do !== null && kinh_do !== undefined) {
      // New location provided - validate it
      const parsedLat = parseFloat(String(vi_do));
      const parsedLng = parseFloat(String(kinh_do));
      
      if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
        locationToValidate = { lat: parsedLat, lng: parsedLng };
      }
    } else if (existingRequest.vi_do !== null && existingRequest.kinh_do !== null) {
      // No new location provided - validate existing location
      const lat = Number(existingRequest.vi_do);
      const lng = Number(existingRequest.kinh_do);
      
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        locationToValidate = { lat, lng };
      }
    }

    // MUST validate location is in Vietnam - ALWAYS (MANDATORY)
    console.log("🔍 [API UPDATE] Validating location:", locationToValidate);
    
    if (!locationToValidate) {
      console.log("❌ [API UPDATE] No location to validate - BLOCKING");
      return NextResponse.json(
        { error: "Yêu cầu phải có vị trí hợp lệ trong lãnh thổ Việt Nam" },
        { status: 400 },
      );
    }
    
    // First validate global coordinates
    const coordValidation = validateCoordinates(
      locationToValidate.lat,
      locationToValidate.lng,
      true // REQUIRE Vietnam bounds
    );
    
    console.log("📊 [API UPDATE] Validation result:", coordValidation);
    
    if (!coordValidation.isValid) {
      console.log("❌ [API UPDATE] Validation failed:", coordValidation.error);
      return NextResponse.json(
        { error: coordValidation.error || "Tọa độ không hợp lệ" },
        { status: 400 },
      );
    }
    
    // CRITICAL: Use reverse geocoding to check ACTUAL country (MORE ACCURATE than bounds)
    const { reverseGeocodeWithCountry } = await import("@/lib/geocoding");
    
    try {
      const { country } = await reverseGeocodeWithCountry(locationToValidate.lat, locationToValidate.lng);
      
      const countryLower = country?.toLowerCase() || "";
      const isVietnamCountry = countryLower === "việt nam" || countryLower === "vietnam" || countryLower.includes("vietnam");
      
      console.log("🌍 [API UPDATE] Geocoding country result:", country, "isVietnam:", isVietnamCountry);
      
      if (!isVietnamCountry) {
        console.log("🚫 [API UPDATE] BLOCKING: Country is not Vietnam:", country);
        return NextResponse.json(
          { error: `Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vị trí này thuộc: ${country || "Không xác định"}.` },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("❌ [API UPDATE] Error checking country:", error);
      // If geocoding fails, fall back to bounds check
      const isInVietnam = isWithinVietnamBounds(locationToValidate.lat, locationToValidate.lng);
      if (!isInVietnam) {
        console.log("🚫 [API UPDATE] BLOCKING: Location outside Vietnam bounds (geocoding failed)");
        return NextResponse.json(
          { error: "Chỉ chấp nhận yêu cầu trong lãnh thổ Việt Nam. Vui lòng chọn vị trí khác." },
          { status: 400 },
        );
      }
      // If bounds check passes but geocoding failed, warn but allow (to avoid blocking valid requests)
      console.log("⚠️ [API UPDATE] Geocoding failed but bounds check passed - allowing");
    }
    
    console.log("✅ [API UPDATE] Validation passed - updating request");

    const updatedRequest = await prisma.yeu_cau_cuu_tros.update({
      where: { id: parseInt(id) },
      data: body,
      include: {
        nguoi_dung: true,
      },
    });

    return NextResponse.json({ request: updatedRequest }, { status: 200 });
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật yêu cầu" },
      { status: 500 },
    );
  }
}

// DELETE /api/requests/[id] - Delete request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.yeu_cau_cuu_tros.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Xóa yêu cầu thành công" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa yêu cầu" },
      { status: 500 },
    );
  }
}

