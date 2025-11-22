import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NotificationService } from "@/lib/notificationService";

// PUT /api/notifications/mark-read - Đánh dấu thông báo đã đọc
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

    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "notificationIds phải là array" },
        { status: 400 }
      );
    }

    // Kiểm tra quyền sở hữu thông báo
    const notifications = await prisma.thong_baos.findMany({
      where: {
        id: { in: notificationIds },
        id_nguoi_nhan: payload.userId,
      },
      select: { id: true },
    });

    const validIds = notifications.map(n => n.id);
    
    await NotificationService.markAsRead(validIds);

    return NextResponse.json({ 
      message: `Đã đánh dấu ${validIds.length} thông báo là đã đọc`,
      markedCount: validIds.length
    });

  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật thông báo" },
      { status: 500 }
    );
  }
}