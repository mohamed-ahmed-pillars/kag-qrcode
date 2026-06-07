import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getRequiredRole, hasRole } from "@/lib/rbac";
import type { Role } from "@/lib/schema";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = session.user.role as Role;
    const requiredRole = getRequiredRole(pathname);

    if (!hasRole(userRole, requiredRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect logged-in users away from login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
