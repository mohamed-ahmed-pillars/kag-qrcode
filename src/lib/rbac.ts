import type { Role } from "./schema";

// Role hierarchy: super_admin > admin > editor > viewer
const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canDelete(role: Role): boolean {
  return hasRole(role, "admin");
}

export function canManageUsers(role: Role): boolean {
  return hasRole(role, "super_admin");
}

export function canEdit(role: Role): boolean {
  return hasRole(role, "editor");
}

export function canView(role: Role): boolean {
  return hasRole(role, "viewer");
}

// Route-level permissions
export const ROUTE_PERMISSIONS: Record<string, Role> = {
  "/dashboard": "viewer",
  "/dashboard/analytics": "viewer",
  "/dashboard/social-links": "editor",
  "/dashboard/employees": "editor",
  "/dashboard/products": "editor",
  "/dashboard/ads": "editor",
  "/dashboard/users": "super_admin",
};

export function getRequiredRole(pathname: string): Role {
  // Find the most specific matching route
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  return matchedRoute ? ROUTE_PERMISSIONS[matchedRoute] : "viewer";
}
