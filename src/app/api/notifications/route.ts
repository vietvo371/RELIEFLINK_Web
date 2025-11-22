import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NotificationService } from "@/lib/notificationService";

// GET /api/notifications - Lấy thông báo của user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";

    let notifications;
    if (unreadOnly) {
      notifications = await prisma.thong_baos.findMany({
        where: { 
          id_nguoi_nhan: payload.userId,
          da_doc: false
        },
        include: {
          nguoi_gui: {
            select: { ho_va_ten: true, vai_tro: true },
          },
          yeu_cau: {
            select: { id: true, loai_yeu_cau: true },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });
    } else {
      notifications = await NotificationService.getUserNotifications(payload.userId, limit);
    }

    const unreadCount = await NotificationService.getUnreadCount(payload.userId);

    return NextResponse.json({ 
      notifications, 
      unreadCount 
    });

  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông báo" },
      { status: 500 }
    );
  }
}

// POST /api/notifications/emergency - Gửi thông báo khẩn cấp (Admin only)
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

    const body = await request.json();
    const { message, area } = body;

    if (!message || !area) {
      return NextResponse.json(
        { error: "Thiếu thông tin message hoặc area" },
        { status: 400 }
      );
    }

    await NotificationService.broadcastEmergencyAlert(
      payload.userId,
      area,
      message
    );

    return NextResponse.json({ 
      message: "Đã gửi thông báo khẩn cấp thành công" 
    });

  } catch (error) {
    console.error("Emergency notification error:", error);
    return NextResponse.json(
      { error: "Lỗi khi gửi thông báo khẩn cấp" },
      { status: 500 }
    );
  }
}