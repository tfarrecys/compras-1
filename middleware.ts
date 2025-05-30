import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === "/login" || path === "/register" || path === "/"

  const token = request.cookies.get("user-token")?.value || ""
  const userType = request.cookies.get("user-type")?.value || ""

  // Si el usuario intenta acceder a una ruta pública estando autenticado
  if (isPublicPath && token) {
    if (userType === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si el usuario intenta acceder a una ruta protegida sin estar autenticado
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si el usuario intenta acceder a rutas de admin sin ser admin
  if (path.startsWith("/admin") && userType !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
}
