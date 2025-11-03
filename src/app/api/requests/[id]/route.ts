import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/requests/[id] - Get single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const requestData = await prisma.yeu_cau_cuu_tros.findUnique({
      where: { id: parseInt(id) },
      include: {
        nguoi_dung: true,
        phan_phois: {
          include: {
            nguon_luc: true,
            tinh_nguyen_vien: true,
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({ request: requestData }, { status: 200 });
  } catch (error) {
    console.error("Get request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin yêu cầu" },
      { status: 500 },
    );
  }
}

// PUT /api/requests/[id] - Update request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedRequest = await prisma.yeu_cau_cuu_tros.update({
      where: { id: parseInt(id) },
      data: body,
      include: {
        nguoi_dung: true,
      },
    });

    return NextResponse.json({ request: updatedRequest }, { status: 200 });
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật yêu cầu" },
      { status: 500 },
    );
  }
}

// DELETE /api/requests/[id] - Delete request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.yeu_cau_cuu_tros.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Xóa yêu cầu thành công" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa yêu cầu" },
      { status: 500 },
    );
  }
}

