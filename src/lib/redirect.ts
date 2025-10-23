/**
 * Utility functions for role-based redirects
 */

export type UserRole = "admin" | "tinh_nguyen_vien" | "nguoi_dan";

/**
 * Get the appropriate dashboard URL based on user role
 * @param role - The user's role
 * @returns The dashboard URL for the role
 */
export function getDashboardUrl(role: UserRole): string {
  console.log("getDashboardUrl called with role:", role);
  switch (role) {
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
      console.warn("Unknown role:", role);
      return "/"; // Default fallback
  }
}

/**
 * Check if a user has access to a specific route based on their role
 * @param userRole - The user's role
 * @param pathname - The pathname to check access for
 * @returns true if user has access, false otherwise
 */
export function hasRouteAccess(userRole: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) {
    return userRole === "admin";
  }
  if (pathname.startsWith("/volunteer")) {
    return userRole === "tinh_nguyen_vien";
  }
  if (pathname.startsWith("/citizen")) {
    return userRole === "nguoi_dan";
  }
  return true; // Allow access to other routes
}

/**
 * Get the appropriate redirect URL when user doesn't have access
 * @param userRole - The user's role
 * @returns The redirect URL
 */
export function getRedirectUrl(userRole: UserRole): string {
  return getDashboardUrl(userRole);
}
