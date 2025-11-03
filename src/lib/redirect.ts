/**
 * Utility functions for role-based redirects
 */

export type UserRole = "admin" | "tinh_nguyen_vien" | "nguoi_dan";

/**
 * Normalize role string to match UserRole type
 * Maps "quan_tri" (quản trị) to "admin" for backward compatibility
 * @param role - The role string from database
 * @returns Normalized UserRole
 */
export function normalizeRole(role: string): UserRole {
  // Map "quan_tri" (quản trị) to "admin"
  if (role === "quan_tri" || role === "admin") {
    return "admin";
  }
  // Map other roles
  if (role === "tinh_nguyen_vien" || role === "volunteer") {
    return "tinh_nguyen_vien";
  }
  if (role === "nguoi_dan" || role === "citizen") {
    return "nguoi_dan";
  }
  // Default fallback to admin for unknown roles
  console.warn("Unknown role:", role, "- defaulting to admin");
  return "admin";
}

/**
 * Get the appropriate dashboard URL based on user role
 * @param role - The user's role (will be normalized)
 * @returns The dashboard URL for the role
 */
export function getDashboardUrl(role: string | UserRole): string {
  const normalizedRole = normalizeRole(role as string);
  console.log("getDashboardUrl called with role:", role, "-> normalized:", normalizedRole);
  switch (normalizedRole) {
    case "admin":
      console.log("Returning admin dashboard URL");
      return "/admin/dashboard";
    case "tinh_nguyen_vien":
      console.log("Returning volunteer dashboard URL");
      return "/volunteer/dashboard";
    case "nguoi_dan":
      console.log("Returning citizen dashboard URL");
      return "/citizen/dashboard";
    default:
      console.warn("Unknown normalized role:", normalizedRole);
      return "/"; // Default fallback
  }
}

/**
 * Check if a user has access to a specific route based on their role
 * @param userRole - The user's role (will be normalized)
 * @param pathname - The pathname to check access for
 * @returns true if user has access, false otherwise
 */
export function hasRouteAccess(userRole: string | UserRole, pathname: string): boolean {
  const normalizedRole = normalizeRole(userRole as string);
  if (pathname.startsWith("/admin")) {
    return normalizedRole === "admin";
  }
  if (pathname.startsWith("/volunteer")) {
    return normalizedRole === "tinh_nguyen_vien";
  }
  if (pathname.startsWith("/citizen")) {
    return normalizedRole === "nguoi_dan";
  }
  return true; // Allow access to other routes
}

/**
 * Get the appropriate redirect URL when user doesn't have access
 * @param userRole - The user's role (will be normalized)
 * @returns The redirect URL
 */
export function getRedirectUrl(userRole: string | UserRole): string {
  return getDashboardUrl(userRole);
}
