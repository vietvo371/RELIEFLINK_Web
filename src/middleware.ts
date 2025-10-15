import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const isPublicRoute = pathname === "/" || pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if token exists and is valid
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role-based access control
  const userRole = payload.vai_tro;

  // Admin routes - only for admin
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(
      new URL(
        userRole === "tinh_nguyen_vien"
          ? "/volunteer/dashboard"
          : "/citizen/dashboard",
        request.url,
      ),
    );
  }

  // Volunteer routes - only for volunteers
  if (pathname.startsWith("/volunteer") && userRole !== "tinh_nguyen_vien") {
    return NextResponse.redirect(
      new URL(
        userRole === "admin" ? "/admin/dashboard" : "/citizen/dashboard",
        request.url,
      ),
    );
  }

  // Citizen routes - only for citizens
  if (pathname.startsWith("/citizen") && userRole !== "nguoi_dan") {
    return NextResponse.redirect(
      new URL(
        userRole === "admin"
          ? "/admin/dashboard"
          : "/volunteer/dashboard",
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/volunteer/:path*",
    "/citizen/:path*",
  ],
};

