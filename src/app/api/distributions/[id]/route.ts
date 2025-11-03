import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTxHash } from "@/lib/blockchain";

// GET /api/distributions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const distribution = await prisma.phan_phois.findUnique({
      where: { id: parseInt(id) },
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
    });

    if (!distribution) {
      return NextResponse.json(
        { error: "Phân phối không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({ distribution }, { status: 200 });
  } catch (error) {
    console.error("Get distribution error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin phân phối" },
      { status: 500 },
    );
  }
}

// PUT /api/distributions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedDistribution = await prisma.phan_phois.update({
      where: { id: parseInt(id) },
      data: body,
      include: {
        yeu_cau: true,
        nguon_luc: true,
        tinh_nguyen_vien: true,
      },
    });

    // Create blockchain log for update
    const ma_giao_dich = generateTxHash();
    await prisma.nhat_ky_blockchains.create({
      data: {
        id_phan_phoi: parseInt(id),
        ma_giao_dich,
        hanh_dong: "phan_phoi_cap_nhat",
        du_lieu: body,
      },
    });

    return NextResponse.json({ distribution: updatedDistribution }, { status: 200 });
  } catch (error) {
    console.error("Update distribution error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật phân phối" },
      { status: 500 },
    );
  }
}

// DELETE /api/distributions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.phan_phois.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Xóa phân phối thành công" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete distribution error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa phân phối" },
      { status: 500 },
    );
  }
}

