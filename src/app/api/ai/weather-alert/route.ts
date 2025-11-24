import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notificationService";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/ai/weather-alert - Nhận cảnh báo thời tiết từ AI service và tạo notification
 * Endpoint này được gọi bởi AI service khi phát hiện nguy cơ thiên tai
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tinh_thanh, disaster_types, risk_level, details, message } = body;

    if (!tinh_thanh || !disaster_types || !Array.isArray(disaster_types)) {
      return NextResponse.json(
        { error: "Thiếu thông tin: tinh_thanh, disaster_types" },
        { status: 400 }
      );
    }

    // Tìm admin đầu tiên để làm sender
    const adminSender = await prisma.nguoi_dungs.findFirst({
      where: {
        vai_tro: {
          in: ["admin", "quan_tri"],
        },
      },
      select: {
        id: true,
      },
    });

    const senderId = adminSender?.id || 1;

    // Tạo message
    const disaster_str = disaster_types.join(", ");
    const risk_emoji = {
      critical: "🚨",
      high: "⚠️",
      medium: "⚡",
      low: "ℹ️",
    };
    const emoji = risk_emoji[risk_level as keyof typeof risk_emoji] || "⚠️";

    let alertMessage = message || `${emoji} CẢNH BÁO: ${disaster_str} có nguy cơ xảy ra tại ${tinh_thanh}`;

    if (details?.current) {
      const current = details.current;
      alertMessage += `\n\nThông tin thời tiết:`;
      alertMessage += `\n- Nhiệt độ: ${current.temp || "N/A"}°C`;
      alertMessage += `\n- Độ ẩm: ${current.humidity || "N/A"}%`;
      if (current.rain > 0) {
        alertMessage += `\n- Mưa: ${current.rain}mm/h`;
      }
      if (current.wind_speed > 0) {
        alertMessage += `\n- Gió: ${current.wind_speed} m/s`;
      }
    }

    // Tìm TẤT CẢ users (admin, volunteer, citizen) - gửi cho tất cả
    // Tìm users có địa chỉ chứa tên tỉnh thành hoặc tất cả users nếu không tìm thấy
    const allUsers = await prisma.nguoi_dungs.findMany({
      where: {
        nhan_thong_bao: true, // Chỉ gửi cho users bật notification
      },
      select: {
        id: true,
        ho_va_ten: true,
        vai_tro: true,
        nhan_thong_bao: true,
      },
    });

    // Nếu có tọa độ trong details, có thể filter theo vùng
    // Nhưng để đơn giản, gửi cho tất cả users có bật notification
    const notifications = [];
    for (const user of allUsers) {
      if (!user.nhan_thong_bao) continue;

      try {
        const notification = await NotificationService.createNotification(
          senderId,
          user.id,
          {
            type: "khan_cap",
            title: `🚨 Cảnh báo thời tiết - ${tinh_thanh}`,
            content: alertMessage,
            priority: risk_level === "critical" ? "urgent" : "high",
          }
        );

        notifications.push(notification);
      } catch (error) {
        console.error(`Error creating notification for user ${user.id}:`, error);
      }
    }

    return NextResponse.json({
      message: "Weather alert notifications created successfully",
      notifications_sent: notifications.length,
      total_users: allUsers.length,
      tinh_thanh,
      disaster_types,
      risk_level,
    });
  } catch (error: any) {
    console.error("Weather alert error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create weather alert" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/weather-alert - Check thời tiết cho một tỉnh thành
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tinh_thanh = searchParams.get("tinh_thanh");

    if (!tinh_thanh) {
      return NextResponse.json(
        { error: "tinh_thanh parameter is required" },
        { status: 400 }
      );
    }

    // Call AI service weather check endpoint
    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/weather/check/${encodeURIComponent(tinh_thanh)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15000), // 15s timeout
        }
      );

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const weatherData = await response.json();
      return NextResponse.json(weatherData);
    } catch (aiError: any) {
      console.error("AI service weather check error:", aiError);
      return NextResponse.json(
        {
          error: "AI service không khả dụng",
          message: aiError?.message,
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Weather check error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check weather" },
      { status: 500 }
    );
  }
}

