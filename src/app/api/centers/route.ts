import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/centers - Get all relief centers
export async function GET() {
  try {
    const centers = await prisma.trung_tam_cuu_tros.findMany({
      include: {
        nguon_lucs: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ centers }, { status: 200 });
  } catch (error) {
    console.error("Get centers error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách trung tâm" },
      { status: 500 },
    );
  }
}

// POST /api/centers - Create new relief center
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ten_trung_tam, dia_chi, vi_do, kinh_do, nguoi_quan_ly, so_lien_he } =
      body;

    const newCenter = await prisma.trung_tam_cuu_tros.create({
      data: {
        ten_trung_tam,
        dia_chi,
        vi_do: vi_do ? parseFloat(vi_do) : null,
        kinh_do: kinh_do ? parseFloat(kinh_do) : null,
        nguoi_quan_ly,
        so_lien_he,
      },
    });

    return NextResponse.json({ center: newCenter }, { status: 201 });
  } catch (error) {
    console.error("Create center error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo trung tâm cứu trợ" },
      { status: 500 },
    );
  }
}

