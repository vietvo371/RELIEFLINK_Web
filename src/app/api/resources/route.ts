import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/resources - Get all resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loai = searchParams.get("loai");
    const id_trung_tam = searchParams.get("id_trung_tam");

    const where: any = {};
    if (loai) where.loai = loai;
    if (id_trung_tam) where.id_trung_tam = parseInt(id_trung_tam);

    const resources = await prisma.nguon_lucs.findMany({
      where,
      include: {
        trung_tam: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error("Get resources error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách nguồn lực" },
      { status: 500 },
    );
  }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ten_nguon_luc, loai, so_luong, don_vi, id_trung_tam } = body;

    const newResource = await prisma.nguon_lucs.create({
      data: {
        ten_nguon_luc,
        loai,
        so_luong: parseInt(so_luong),
        don_vi,
        id_trung_tam: parseInt(id_trung_tam),
      },
      include: {
        trung_tam: true,
      },
    });

    return NextResponse.json({ resource: newResource }, { status: 201 });
  } catch (error) {
    console.error("Create resource error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo nguồn lực" },
      { status: 500 },
    );
  }
}

