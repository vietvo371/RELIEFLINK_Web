import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMockPrediction, generateMultiplePredictions } from "@/lib/ai";

// GET /api/ai - Get AI predictions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tinh_thanh = searchParams.get("tinh_thanh");
    const generate = searchParams.get("generate"); // If true, generate new predictions

    if (generate === "true") {
      // Generate and return new mock predictions without saving
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
    const { generate_multiple } = body;

    if (generate_multiple) {
      // Generate and save multiple predictions
      const predictions = generateMultiplePredictions(10);

      const savedPredictions = await prisma.du_bao_ais.createMany({
        data: predictions,
      });

      return NextResponse.json(
        {
          message: `Đã tạo ${savedPredictions.count} dự báo mới`,
          count: savedPredictions.count,
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

