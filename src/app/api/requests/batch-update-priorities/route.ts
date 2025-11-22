import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { RequestWorkflowService } from "@/lib/requestWorkflow";

// POST /api/requests/batch-update-priorities - Cập nhật priority cho tất cả requests
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.vai_tro !== "admin" && payload.vai_tro !== "quan_tri")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Batch update tất cả priorities
    await RequestWorkflowService.batchUpdatePriorities();

    return NextResponse.json({
      message: "Đã cập nhật priority cho tất cả yêu cầu thành công"
    });

  } catch (error) {
    console.error("Batch update priorities error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật priorities" },
      { status: 500 }
    );
  }
}