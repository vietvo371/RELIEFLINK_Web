import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NotificationService } from "@/lib/notificationService";

// PUT /api/notifications/read-all - Đánh dấu tất cả thông báo của user đã đọc
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Lấy tất cả thông báo chưa đọc của user
    const unreadNotifications = await prisma.thong_baos.findMany({
      where: {
        id_nguoi_nhan: payload.userId,
        da_doc: false,
      },
      select: { id: true },
    });

    const notificationIds = unreadNotifications.map((n) => n.id);

    if (notificationIds.length === 0) {
      return NextResponse.json({
        message: "Không có thông báo nào cần đánh dấu",
        markedCount: 0,
      });
    }

    // Đánh dấu tất cả đã đọc
    await NotificationService.markAsRead(notificationIds);

    return NextResponse.json({
      message: `Đã đánh dấu ${notificationIds.length} thông báo là đã đọc`,
      markedCount: notificationIds.length,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật thông báo" },
      { status: 500 }
    );
  }
}

