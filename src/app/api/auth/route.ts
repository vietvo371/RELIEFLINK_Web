import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

// POST /api/auth - Login or Register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, mat_khau, ho_va_ten, vai_tro, so_dien_thoai } =
      body;

    if (action === "login") {
      // Login logic
      const user = await prisma.nguoi_dungs.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Email không tồn tại" },
          { status: 404 },
        );
      }

      const isValidPassword = await comparePassword(mat_khau, user.mat_khau);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Mật khẩu không đúng" },
          { status: 401 },
        );
      }

      const token = await signToken({
        userId: user.id,
        email: user.email,
        vai_tro: user.vai_tro,
      });

      const response = NextResponse.json(
        {
          user: {
            id: user.id,
            ho_va_ten: user.ho_va_ten,
            email: user.email,
            vai_tro: user.vai_tro,
            so_dien_thoai: user.so_dien_thoai,
            hinh_anh: user.hinh_anh,
          },
          token,
        },
        { status: 200 },
      );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } else if (action === "register") {
      // Register logic
      const existingUser = await prisma.nguoi_dungs.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email đã được sử dụng" },
          { status: 400 },
        );
      }

      const hashedPassword = await hashPassword(mat_khau);

      const newUser = await prisma.nguoi_dungs.create({
        data: {
          ho_va_ten,
          email,
          mat_khau: hashedPassword,
          vai_tro: vai_tro || "nguoi_dan",
          so_dien_thoai,
        },
      });

      const token = await signToken({
        userId: newUser.id,
        email: newUser.email,
        vai_tro: newUser.vai_tro,
      });

      const response = NextResponse.json(
        {
          user: {
            id: newUser.id,
            ho_va_ten: newUser.ho_va_ten,
            email: newUser.email,
            vai_tro: newUser.vai_tro,
            so_dien_thoai: newUser.so_dien_thoai,
          },
          token,
        },
        { status: 201 },
      );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "Action không hợp lệ" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Lỗi server", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// GET /api/auth - Get current user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verifyToken } = await import("@/lib/jwt");
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.nguoi_dungs.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        ho_va_ten: true,
        email: true,
        vai_tro: true,
        so_dien_thoai: true,
        hinh_anh: true,
        vi_do: true,
        kinh_do: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Lỗi server" },
      { status: 500 },
    );
  }
}

// DELETE /api/auth - Logout
export async function DELETE() {
  const response = NextResponse.json(
    { message: "Đăng xuất thành công" },
    { status: 200 },
  );

  response.cookies.delete("token");

  return response;
}

