import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NotificationService } from "@/lib/notificationService";

// PUT /api/notifications/[id]/read - Đánh dấu một thông báo đã đọc
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    // Kiểm tra quyền sở hữu thông báo
    const notification = await prisma.thong_baos.findFirst({
      where: {
        id: notificationId,
        id_nguoi_nhan: payload.userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found or access denied" },
        { status: 404 }
      );
    }

    // Đánh dấu đã đọc
    await NotificationService.markAsRead([notificationId]);

    return NextResponse.json({
      message: "Đã đánh dấu thông báo là đã đọc",
      notificationId,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật thông báo" },
      { status: 500 }
    );
  }
}

