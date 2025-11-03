import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTxHash } from "@/lib/blockchain";

// GET /api/blockchain - Get blockchain logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_phan_phoi = searchParams.get("id_phan_phoi");

    const where: any = {};
    if (id_phan_phoi) where.id_phan_phoi = parseInt(id_phan_phoi);

    const logs = await prisma.nhat_ky_blockchains.findMany({
      where,
      include: {
        phan_phoi: {
          include: {
            yeu_cau: true,
            nguon_luc: true,
            tinh_nguyen_vien: true,
          },
        },
      },
      orderBy: {
        thoi_gian: "desc",
      },
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Get blockchain logs error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy nhật ký blockchain" },
      { status: 500 },
    );
  }
}

// POST /api/blockchain - Create blockchain log manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_phan_phoi, hanh_dong, du_lieu } = body;

    const ma_giao_dich = generateTxHash();

    const newLog = await prisma.nhat_ky_blockchains.create({
      data: {
        id_phan_phoi: parseInt(id_phan_phoi),
        ma_giao_dich,
        hanh_dong,
        du_lieu,
      },
      include: {
        phan_phoi: true,
      },
    });

    return NextResponse.json({ log: newLog }, { status: 201 });
  } catch (error) {
    console.error("Create blockchain log error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo nhật ký blockchain" },
      { status: 500 },
    );
  }
}

