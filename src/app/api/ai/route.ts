import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMockPrediction, generateMultiplePredictions } from "@/lib/ai";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// GET /api/ai - Get AI predictions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tinh_thanh = searchParams.get("tinh_thanh");
    const generate = searchParams.get("generate"); // If true, generate new predictions
    const usePythonAI = searchParams.get("use_python") === "true"; // Use Python AI service

    if (generate === "true") {
      // Nếu có Python AI service và use_python=true, gọi Python service
      if (usePythonAI) {
        try {
          const provinces = tinh_thanh
            ? [tinh_thanh]
            : [
                "Hà Nội",
                "Hồ Chí Minh",
                "Đà Nẵng",
                "Hải Phòng",
                "Cần Thơ",
                "Quảng Ninh",
                "Thừa Thiên Huế",
                "Nghệ An",
                "Thanh Hóa",
                "Bình Định",
              ];

          const batchRequests = provinces.map((province) => ({
            tinh_thanh: province,
            loai_thien_tai: undefined,
            so_nguoi: undefined,
          }));

          const response = await fetch(`${AI_SERVICE_URL}/predict/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batchRequests),
            signal: AbortSignal.timeout(15000), // 15s timeout
          });

          if (response.ok) {
            const predictions = await response.json();
            return NextResponse.json({ predictions }, { status: 200 });
          }
        } catch (error) {
          console.error("Python AI service error:", error);
          // Fallback to mock data
        }
      }

      // Fallback: Generate and return new mock predictions without saving
      const predictions = generateMultiplePredictions(10);
      return NextResponse.json({ predictions }, { status: 200 });
    }

    // Fetch from database
    const where: any = {};
    if (tinh_thanh) where.tinh_thanh = tinh_thanh;

    const predictions = await prisma.du_bao_ais.findMany({
      where,
      orderBy: {
        ngay_du_bao: "desc",
      },
      take: 20,
    });

    return NextResponse.json({ predictions }, { status: 200 });
  } catch (error) {
    console.error("Get AI predictions error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy dự báo AI" },
      { status: 500 },
    );
  }
}

// POST /api/ai - Save AI prediction to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generate_multiple, use_python } = body;

    if (generate_multiple) {
      // Nếu có Python AI service và use_python=true, gọi Python service
      if (use_python) {
        try {
          const provinces = [
            "Hà Nội",
            "Hồ Chí Minh",
            "Đà Nẵng",
            "Hải Phòng",
            "Cần Thơ",
            "Quảng Ninh",
            "Thừa Thiên Huế",
            "Nghệ An",
            "Thanh Hóa",
            "Bình Định",
          ];

          const disasterTypes = [
            "Lũ lụt",
            "Bão",
            "Hạn hán",
            "Sạt lở đất",
            "Động đất",
            "Cháy rừng",
          ];

          const batchRequests = provinces
            .flatMap((province) =>
              disasterTypes.slice(0, 2).map((disaster) => ({
                tinh_thanh: province,
                loai_thien_tai: disaster,
                so_nguoi: undefined,
              }))
            )
            .slice(0, 10);

          const response = await fetch(`${AI_SERVICE_URL}/predict/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batchRequests),
            signal: AbortSignal.timeout(15000),
          });

          if (response.ok) {
            const predictions = await response.json();
            
            // Convert Python response format to database format
            const predictionsToSave = predictions.map((pred: any) => ({
              tinh_thanh: pred.tinh_thanh,
              loai_thien_tai: pred.loai_thien_tai,
              du_doan_nhu_cau_thuc_pham: pred.du_doan_nhu_cau_thuc_pham,
              du_doan_nhu_cau_nuoc: pred.du_doan_nhu_cau_nuoc,
              du_doan_nhu_cau_thuoc: pred.du_doan_nhu_cau_thuoc,
              du_doan_nhu_cau_cho_o: pred.du_doan_nhu_cau_cho_o,
              ngay_du_bao: new Date(pred.ngay_du_bao),
            }));

            const savedPredictions = await prisma.du_bao_ais.createMany({
              data: predictionsToSave,
            });

            return NextResponse.json(
              {
                message: `Đã tạo ${savedPredictions.count} dự báo mới từ Python AI Service`,
                count: savedPredictions.count,
                method: "python_ai",
              },
              { status: 201 }
            );
          }
        } catch (error) {
          console.error("Python AI service error:", error);
          // Fallback to mock data
        }
      }

      // Fallback: Generate and save multiple predictions (mock)
      const predictions = generateMultiplePredictions(10);

      const savedPredictions = await prisma.du_bao_ais.createMany({
        data: predictions,
      });

      return NextResponse.json(
        {
          message: `Đã tạo ${savedPredictions.count} dự báo mới`,
          count: savedPredictions.count,
          method: "mock",
        },
        { status: 201 },
      );
    }

    // Save single prediction
    const {
      tinh_thanh,
      loai_thien_tai,
      du_doan_nhu_cau_thuc_pham,
      du_doan_nhu_cau_nuoc,
      du_doan_nhu_cau_thuoc,
      du_doan_nhu_cau_cho_o,
      ngay_du_bao,
    } = body;

    const newPrediction = await prisma.du_bao_ais.create({
      data: {
        tinh_thanh,
        loai_thien_tai,
        du_doan_nhu_cau_thuc_pham: parseInt(du_doan_nhu_cau_thuc_pham),
        du_doan_nhu_cau_nuoc: parseInt(du_doan_nhu_cau_nuoc),
        du_doan_nhu_cau_thuoc: parseInt(du_doan_nhu_cau_thuoc),
        du_doan_nhu_cau_cho_o: parseInt(du_doan_nhu_cau_cho_o),
        ngay_du_bao: new Date(ngay_du_bao),
      },
    });

    return NextResponse.json({ prediction: newPrediction }, { status: 201 });
  } catch (error) {
    console.error("Create AI prediction error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo dự báo AI" },
      { status: 500 },
    );
  }
}

