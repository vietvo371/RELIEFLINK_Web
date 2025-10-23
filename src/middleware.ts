import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDashboardUrl, hasRouteAccess, getRedirectUrl } from "@/lib/redirect";

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
  const userRole = payload.vai_tro as "admin" | "tinh_nguyen_vien" | "nguoi_dan";
  console.log("Middleware - User role:", userRole);
  console.log("Middleware - Current pathname:", pathname);

  // Check if user has access to the current route
  const hasAccess = hasRouteAccess(userRole, pathname);
  console.log("Middleware - Has access:", hasAccess);
  
  if (!hasAccess) {
    const redirectUrl = getRedirectUrl(userRole);
    console.log("Middleware - Redirecting to:", redirectUrl);
    return NextResponse.redirect(
      new URL(redirectUrl, request.url)
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

