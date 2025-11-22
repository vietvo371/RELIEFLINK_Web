/**
 * Notification Service
 * Quản lý hệ thống thông báo realtime cho workflow
 */

import { prisma } from "./prisma";

export interface NotificationData {
  type: "yeu_cau_moi" | "phe_duyet" | "tu_choi" | "phan_phoi" | "khan_cap";
  title: string;
  content: string;
  requestId?: number;
  priority?: "low" | "medium" | "high" | "urgent";
}

export class NotificationService {
  /**
   * Tạo thông báo mới
   */
  static async createNotification(
    senderId: number,
    receiverId: number,
    data: NotificationData
  ) {
    try {
      const notification = await prisma.thong_baos.create({
        data: {
          id_nguoi_gui: senderId,
          id_nguoi_nhan: receiverId,
          id_yeu_cau: data.requestId,
          loai_thong_bao: data.type,
          tieu_de: data.title,
          noi_dung: data.content,
        },
        include: {
          nguoi_gui: {
            select: { ho_va_ten: true, vai_tro: true },
          },
          nguoi_nhan: {
            select: { ho_va_ten: true, email: true, nhan_thong_bao: true },
          },
          yeu_cau: {
            select: { id: true, loai_yeu_cau: true, do_uu_tien: true },
          },
        },
      });

      // Gửi email nếu user bật tính năng
      if (notification.nguoi_nhan.nhan_thong_bao) {
        this.sendEmailNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error("Create notification error:", error);
      throw error;
    }
  }

  /**
   * Thông báo khi có yêu cầu mới cho tất cả Admin
   */
  static async notifyNewRequest(requestId: number, citizenId: number) {
    try {
      const request = await prisma.yeu_cau_cuu_tros.findUnique({
        where: { id: requestId },
        include: { nguoi_dung: true },
      });

      if (!request) return;

      // Lấy tất cả admin
      const admins = await prisma.nguoi_dungs.findMany({
        where: { vai_tro: "admin" },
        select: { id: true, ho_va_ten: true },
      });

      // Tạo thông báo cho từng admin
      const notifications = admins.map((admin) =>
        this.createNotification(citizenId, admin.id, {
          type: "yeu_cau_moi",
          title: "🆘 Yêu cầu cứu trợ mới",
          content: `${request.nguoi_dung.ho_va_ten} đã gửi yêu cầu ${request.loai_yeu_cau} cho ${request.so_nguoi} người. Độ ưu tiên: ${request.do_uu_tien.toUpperCase()}`,
          requestId,
          priority: this.mapUrgencyToPriority(request.do_uu_tien),
        })
      );

      await Promise.all(notifications);
      
      console.log(`Sent new request notifications to ${admins.length} admins`);
    } catch (error) {
      console.error("Notify new request error:", error);
    }
  }

  /**
   * Thông báo kết quả phê duyệt cho citizen
   */
  static async notifyApprovalResult(
    requestId: number,
    adminId: number,
    approved: boolean,
    reason?: string
  ) {
    try {
      const request = await prisma.yeu_cau_cuu_tros.findUnique({
        where: { id: requestId },
        include: { nguoi_dung: true, nguoi_phe_duyet: true },
      });

      if (!request) return;

      const notificationData: NotificationData = approved
        ? {
            type: "phe_duyet",
            title: "✅ Yêu cầu được phê duyệt",
            content: `Yêu cầu ${request.loai_yeu_cau} của bạn đã được Admin ${request.nguoi_phe_duyet?.ho_va_ten} phê duyệt. Chúng tôi sẽ sớm liên hệ để hỗ trợ.`,
            requestId,
            priority: "high",
          }
        : {
            type: "tu_choi",
            title: "❌ Yêu cầu bị từ chối",
            content: `Yêu cầu ${request.loai_yeu_cau} của bạn đã bị từ chối. Lý do: ${reason || "Không đủ điều kiện"}`,
            requestId,
            priority: "medium",
          };

      await this.createNotification(adminId, request.id_nguoi_dung, notificationData);
    } catch (error) {
      console.error("Notify approval result error:", error);
    }
  }

  /**
   * Thông báo khi có phân phối mới cho volunteer
   */
  static async notifyNewDistribution(distributionId: number) {
    try {
      const distribution = await prisma.phan_phois.findUnique({
        where: { id: distributionId },
        include: {
          yeu_cau: { include: { nguoi_dung: true } },
          nguon_luc: { include: { trung_tam: true } },
          tinh_nguyen_vien: true,
        },
      });

      if (!distribution) return;

      await this.createNotification(1, distribution.id_tinh_nguyen_vien, {
        type: "phan_phoi",
        title: "📦 Nhiệm vụ phân phối mới",
        content: `Bạn được phân công giao ${distribution.nguon_luc.ten_nguon_luc} đến ${distribution.yeu_cau.nguoi_dung.ho_va_ten} tại ${distribution.nguon_luc.trung_tam.dia_chi}`,
        requestId: distribution.id_yeu_cau,
        priority: "high",
      });
    } catch (error) {
      console.error("Notify new distribution error:", error);
    }
  }

  /**
   * Thông báo khẩn cấp cho tất cả users trong vùng
   */
  static async broadcastEmergencyAlert(
    adminId: number,
    area: { lat: number; lng: number; radius: number }, // km
    message: string
  ) {
    try {
      // Tìm tất cả users trong bán kính
      const usersInArea = await prisma.nguoi_dungs.findMany({
        where: {
          AND: [
            { vi_do: { not: null } },
            { kinh_do: { not: null } },
            { nhan_thong_bao: true },
          ],
        },
      });

      const notifications = [];
      
      for (const user of usersInArea) {
        if (!user.vi_do || !user.kinh_do) continue;
        
        // Tính khoảng cách
        const distance = this.calculateDistance(
          Number(user.vi_do),
          Number(user.kinh_do),
          area.lat,
          area.lng
        );

        if (distance <= area.radius) {
          notifications.push(
            this.createNotification(adminId, user.id, {
              type: "khan_cap",
              title: "🚨 CẢNH BÁO KHẨN CẤP",
              content: message,
              priority: "urgent",
            })
          );
        }
      }

      await Promise.all(notifications);
      console.log(`Sent emergency alert to ${notifications.length} users`);
    } catch (error) {
      console.error("Broadcast emergency alert error:", error);
    }
  }

  /**
   * Lấy thông báo của user
   */
  static async getUserNotifications(userId: number, limit = 20) {
    return await prisma.thong_baos.findMany({
      where: { id_nguoi_nhan: userId },
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
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  static async markAsRead(notificationIds: number[]) {
    return await prisma.thong_baos.updateMany({
      where: { id: { in: notificationIds } },
      data: { da_doc: true },
    });
  }

  /**
   * Đếm thông báo chưa đọc
   */
  static async getUnreadCount(userId: number) {
    return await prisma.thong_baos.count({
      where: {
        id_nguoi_nhan: userId,
        da_doc: false,
      },
    });
  }

  /**
   * Gửi email notification (mock)
   */
  private static async sendEmailNotification(notification: any) {
    // TODO: Integrate với email service (SendGrid, AWS SES, etc.)
    console.log(`📧 Email sent to ${notification.nguoi_nhan.email}: ${notification.tieu_de}`);
  }

  /**
   * Map độ ưu tiên
   */
  private static mapUrgencyToPriority(urgency: string): "low" | "medium" | "high" | "urgent" {
    const mapping = {
      thap: "low" as const,
      trung_binh: "medium" as const,
      cao: "high" as const,
    };
    return mapping[urgency as keyof typeof mapping] || "medium";
  }

  /**
   * Tính khoảng cách (sử dụng lại từ RequestWorkflowService)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}