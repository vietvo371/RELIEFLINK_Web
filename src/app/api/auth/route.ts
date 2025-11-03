import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_change_me",
);

interface TokenPayload {
  userId: number;
  email: string;
  vai_tro: string;
}

async function signToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, mat_khau, ho_va_ten, so_dien_thoai, vai_tro } = body;

    if (action === "login") {
      // Login logic
      const user = await prisma.nguoi_dungs.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không đúng" },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(mat_khau, user.mat_khau);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không đúng" },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = await signToken({
        userId: user.id,
        email: user.email,
        vai_tro: user.vai_tro,
      });

      const response = NextResponse.json({
        message: "Đăng nhập thành công",
        user: {
          id: user.id,
          email: user.email,
          ho_va_ten: user.ho_va_ten,
          so_dien_thoai: user.so_dien_thoai,
          vai_tro: user.vai_tro,
        },
        token,
      });

      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } else if (action === "register") {
      // Check if user exists
      const existingUser = await prisma.nguoi_dungs.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email đã được sử dụng" },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(mat_khau, 10);

      // Create user
      const user = await prisma.nguoi_dungs.create({
        data: {
          email,
          mat_khau: hashedPassword,
          ho_va_ten,
          so_dien_thoai,
          vai_tro,
        },
      });

      // Generate JWT token
      const token = await signToken({
        userId: user.id,
        email: user.email,
        vai_tro: user.vai_tro,
      });

      const response = NextResponse.json({
        message: "Đăng ký thành công",
        user: {
          id: user.id,
          email: user.email,
          ho_va_ten: user.ho_va_ten,
          so_dien_thoai: user.so_dien_thoai,
          vai_tro: user.vai_tro,
        },
        token,
      });

      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
