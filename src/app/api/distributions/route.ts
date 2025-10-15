import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTxHash } from "@/lib/blockchain";

// GET /api/distributions - Get all distributions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trang_thai = searchParams.get("trang_thai");

    const where: any = {};
    if (trang_thai) where.trang_thai = trang_thai;

    const distributions = await prisma.phan_phois.findMany({
      where,
      include: {
        yeu_cau: {
          include: {
            nguoi_dung: true,
          },
        },
        nguon_luc: {
          include: {
            trung_tam: true,
          },
        },
        tinh_nguyen_vien: true,
        nhat_ky_blockchains: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json({ distributions }, { status: 200 });
  } catch (error) {
    console.error("Get distributions error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách phân phối" },
      { status: 500 },
    );
  }
}

// POST /api/distributions - Create new distribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_yeu_cau,
      id_nguon_luc,
      id_tinh_nguyen_vien,
      trang_thai,
      thoi_gian_xuat,
    } = body;

    // Generate blockchain transaction hash
    const ma_giao_dich = generateTxHash();

    const newDistribution = await prisma.phan_phois.create({
      data: {
        id_yeu_cau: parseInt(id_yeu_cau),
        id_nguon_luc: parseInt(id_nguon_luc),
        id_tinh_nguyen_vien: parseInt(id_tinh_nguyen_vien),
        trang_thai: trang_thai || "dang_chuan_bi",
        ma_giao_dich,
        thoi_gian_xuat: thoi_gian_xuat ? new Date(thoi_gian_xuat) : null,
      },
      include: {
        yeu_cau: true,
        nguon_luc: true,
        tinh_nguyen_vien: true,
      },
    });

    // Create blockchain log entry
    await prisma.nhat_ky_blockchains.create({
      data: {
        id_phan_phoi: newDistribution.id,
        ma_giao_dich,
        hanh_dong: "phan_phoi_tao_moi",
        du_lieu: {
          id_yeu_cau,
          id_nguon_luc,
          id_tinh_nguyen_vien,
          trang_thai,
        },
      },
    });

    return NextResponse.json({ distribution: newDistribution }, { status: 201 });
  } catch (error) {
    console.error("Create distribution error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo phân phối" },
      { status: 500 },
    );
  }
}

