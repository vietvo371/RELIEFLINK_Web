import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { RequestWorkflowService } from "@/lib/requestWorkflow";
import { NotificationService } from "@/lib/notificationService";

// PUT /api/requests/[id]/approve - Phê duyệt yêu cầu
export async function PUT(
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
    const body = await request.json();
    const { approved, reason } = body;

    // Cập nhật trạng thái phê duyệt
    const updatedRequest = await prisma.yeu_cau_cuu_tros.update({
      where: { id: requestId },
      data: {
        trang_thai_phe_duyet: approved ? "da_phe_duyet" : "tu_choi",
        id_nguoi_phe_duyet: payload.userId,
        thoi_gian_phe_duyet: new Date(),
        ly_do_tu_choi: approved ? null : reason,
        trang_thai: approved ? "da_phe_duyet" : "bi_tu_choi",
      },
      include: {
        nguoi_dung: true,
        nguoi_phe_duyet: {
          select: { ho_va_ten: true },
        },
      },
    });

    // Gửi thông báo cho citizen
    await NotificationService.notifyApprovalResult(
      requestId,
      payload.userId,
      approved,
      reason
    );

    // Nếu được phê duyệt, tự động tính priority và tìm resource match
    if (approved) {
      try {
        // Cập nhật priority score
        await RequestWorkflowService.updateRequestPriority(requestId);
        
        // Tự động match với resource
        const matchResult = await RequestWorkflowService.findBestResourceMatch(requestId);
        
        // Fetch lại request đầy đủ với tất cả relations sau khi match
        const fullyUpdatedRequest = await prisma.yeu_cau_cuu_tros.findUnique({
          where: { id: requestId },
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
                    vi_do: true,
                    kinh_do: true,
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
        });
        
        return NextResponse.json({
          request: fullyUpdatedRequest,
          autoMatch: matchResult,
          message: matchResult 
            ? "Yêu cầu đã được phê duyệt và tự động match với nguồn lực" 
            : "Yêu cầu đã được phê duyệt nhưng không tìm thấy nguồn lực phù hợp"
        });
      } catch (matchError) {
        console.error("Auto-match error:", matchError);
        
        // Fetch lại request đầy đủ ngay cả khi match thất bại
        const fullyUpdatedRequest = await prisma.yeu_cau_cuu_tros.findUnique({
          where: { id: requestId },
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
        });
        
        return NextResponse.json({
          request: fullyUpdatedRequest,
          message: "Yêu cầu đã được phê duyệt nhưng không tìm thấy nguồn lực phù hợp"
        });
      }
    }

    // Fetch lại request đầy đủ với relations khi từ chối
    const fullyUpdatedRequest = await prisma.yeu_cau_cuu_tros.findUnique({
      where: { id: requestId },
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
    });
    
    return NextResponse.json({
      request: fullyUpdatedRequest,
      message: "Yêu cầu đã bị từ chối"
    });

  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xử lý phê duyệt" },
      { status: 500 }
    );
  }
}