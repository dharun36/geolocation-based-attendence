import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/api/auth"]

// Define role-based route access
const roleBasedRoutes = {
  ADMIN: ["/admin", "/dashboard", "/users", "/locations", "/attendance", "/reports"],
  MANAGER: ["/dashboard", "/attendance", "/reports"],
  EMPLOYEE: ["/dashboard", "/attendance/my-attendance"],
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role
  const pathname = nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Redirect logged-in users away from login/register
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  if (userRole) {
    const allowedRoutes = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes] || []
    const hasAccess = allowedRoutes.some((route: string) => pathname.startsWith(route))

    if (!hasAccess && pathname !== "/") {
      // Redirect to default dashboard if user doesn't have access
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY")
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")
  
  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
})

// Configure which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
}
