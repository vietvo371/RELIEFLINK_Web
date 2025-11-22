import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { RequestWorkflowService } from "@/lib/requestWorkflow";

// POST /api/requests/[id]/auto-match - Manually trigger auto-matching cho yêu cầu đã được phê duyệt
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.vai_tro !== "admin" && payload.vai_tro !== "quan_tri")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const requestId = parseInt(params.id);
    
    if (isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    // Kiểm tra request có tồn tại và đã được phê duyệt chưa
    const existingRequest = await prisma.yeu_cau_cuu_tros.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        trang_thai_phe_duyet: true,
        loai_yeu_cau: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu" }, { status: 404 });
    }

    if (existingRequest.trang_thai_phe_duyet !== "da_phe_duyet") {
      return NextResponse.json(
        { error: "Chỉ có thể auto-match yêu cầu đã được phê duyệt" },
        { status: 400 }
      );
    }

    // Cập nhật priority score trước khi match
    await RequestWorkflowService.updateRequestPriority(requestId);

    // Tự động match với resource
    try {
      const matchResult = await RequestWorkflowService.findBestResourceMatch(requestId);

      // Lấy request đã được cập nhật
      const updatedRequest = await prisma.yeu_cau_cuu_tros.findUnique({
        where: { id: requestId },
        include: {
          nguon_luc_match: {
            select: {
              id: true,
              ten_nguon_luc: true,
            },
          },
        },
      });

      if (!matchResult) {
        // Không tìm thấy match, cập nhật trạng thái
        await prisma.yeu_cau_cuu_tros.update({
          where: { id: requestId },
          data: {
            trang_thai_matching: "khong_match",
          },
        });

        return NextResponse.json({
          request: updatedRequest,
          autoMatch: null,
          message: "Không tìm thấy nguồn lực phù hợp",
        });
      }

      return NextResponse.json({
        request: updatedRequest,
        autoMatch: matchResult,
        message: "Đã tự động match với nguồn lực phù hợp",
      });
    } catch (matchError: any) {
      console.error("Auto-match error:", matchError);
      
      // Cập nhật trạng thái matching thành "khong_match" nếu có lỗi
      await prisma.yeu_cau_cuu_tros.update({
        where: { id: requestId },
        data: {
          trang_thai_matching: "khong_match",
        },
      });

      return NextResponse.json({
        message: "Không tìm thấy nguồn lực phù hợp cho yêu cầu này",
        error: matchError?.message || "Auto-match failed",
      }, { status: 200 }); // Vẫn return 200 vì đây không phải lỗi nghiêm trọng
    }

  } catch (error: any) {
    console.error("Trigger auto-match error:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi khi kích hoạt auto-matching" },
      { status: 500 }
    );
  }
}
