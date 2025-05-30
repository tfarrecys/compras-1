import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAdmin = token?.role === "admin"
  const path = request.nextUrl.pathname

  // Rutas públicas (accesibles sin autenticación)
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"]
  if (publicRoutes.includes(path)) {
    // Si el usuario ya está autenticado y trata de acceder a login/register, redirigir
    if (isAuthenticated && (path === "/login" || path === "/register")) {
      return NextResponse.redirect(new URL(isAdmin ? "/admin/dashboard" : "/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Rutas de administrador
  if (path.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Rutas de usuario
  if (path.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Cualquier otra ruta requiere autenticación
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos Next.js)
     * 3. /fonts (archivos estáticos)
     * 4. /favicon.ico (favicon)
     */
    "/((?!api|_next|fonts|favicon.ico).*)",
  ],
}
