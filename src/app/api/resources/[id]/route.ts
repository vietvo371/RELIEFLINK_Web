import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/resources/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const resource = await prisma.nguon_lucs.findUnique({
      where: { id: parseInt(id) },
      include: {
        trung_tam: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Nguồn lực không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({ resource }, { status: 200 });
  } catch (error) {
    console.error("Get resource error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin nguồn lực" },
      { status: 500 },
    );
  }
}

// PUT /api/resources/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedResource = await prisma.nguon_lucs.update({
      where: { id: parseInt(id) },
      data: body,
      include: {
        trung_tam: true,
      },
    });

    return NextResponse.json({ resource: updatedResource }, { status: 200 });
  } catch (error) {
    console.error("Update resource error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật nguồn lực" },
      { status: 500 },
    );
  }
}

// DELETE /api/resources/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.nguon_lucs.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Xóa nguồn lực thành công" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete resource error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa nguồn lực" },
      { status: 500 },
    );
  }
}

