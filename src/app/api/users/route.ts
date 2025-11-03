import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users - Get all users (filter by role)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vai_tro = searchParams.get("vai_tro");

    const where: any = {};
    if (vai_tro) where.vai_tro = vai_tro;

    const users = await prisma.nguoi_dungs.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        ho_va_ten: true,
        email: true,
        so_dien_thoai: true,
        vai_tro: true,
        created_at: true,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách người dùng" }, { status: 500 });
  }
}
