import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    const user = await prisma.nguoi_dungs.findUnique({
      where: { id: userId },
      select: {
        id: true,
        ho_va_ten: true,
        email: true,
        so_dien_thoai: true,
        vai_tro: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin người dùng" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user info
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { ho_va_ten, so_dien_thoai } = body;

    // Validate input
    if (!ho_va_ten || !ho_va_ten.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ và tên" },
        { status: 400 }
      );
    }

    if (ho_va_ten.trim().length < 2) {
      return NextResponse.json(
        { error: "Họ và tên phải có ít nhất 2 ký tự" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (so_dien_thoai && so_dien_thoai.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(so_dien_thoai.trim())) {
        return NextResponse.json(
          { error: "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số" },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await prisma.nguoi_dungs.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await prisma.nguoi_dungs.update({
      where: { id: userId },
      data: {
        ho_va_ten: ho_va_ten.trim(),
        so_dien_thoai: so_dien_thoai?.trim() || null,
      },
      select: {
        id: true,
        ho_va_ten: true,
        email: true,
        so_dien_thoai: true,
        vai_tro: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(
      { 
        message: "Cập nhật thông tin thành công",
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật thông tin người dùng" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (optional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.nguoi_dungs.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.nguoi_dungs.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "Xóa người dùng thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa người dùng" },
      { status: 500 }
    );
  }
}

