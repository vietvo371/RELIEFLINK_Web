import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/requests - Get all relief requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trang_thai = searchParams.get("trang_thai");
    const do_uu_tien = searchParams.get("do_uu_tien");

    const where: any = {};
    if (trang_thai) where.trang_thai = trang_thai;
    if (do_uu_tien) where.do_uu_tien = do_uu_tien;

    const requests = await prisma.yeu_cau_cuu_tros.findMany({
      where,
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_va_ten: true,
            email: true,
            so_dien_thoai: true,
          },
        },
        phan_phois: {
          include: {
            nguon_luc: true,
            tinh_nguyen_vien: {
              select: {
                ho_va_ten: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách yêu cầu" },
      { status: 500 },
    );
  }
}

// POST /api/requests - Create new relief request
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      loai_yeu_cau,
      mo_ta,
      so_nguoi,
      do_uu_tien,
      vi_do,
      kinh_do,
      trang_thai,
    } = body;

    const newRequest = await prisma.yeu_cau_cuu_tros.create({
      data: {
        id_nguoi_dung: payload.userId,
        loai_yeu_cau,
        mo_ta,
        so_nguoi: parseInt(so_nguoi),
        do_uu_tien: do_uu_tien || "trung_binh",
        vi_do: vi_do ? parseFloat(vi_do) : null,
        kinh_do: kinh_do ? parseFloat(kinh_do) : null,
        trang_thai: trang_thai || "cho_xu_ly",
      },
      include: {
        nguoi_dung: {
          select: {
            ho_va_ten: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo yêu cầu cứu trợ" },
      { status: 500 },
    );
  }
}

