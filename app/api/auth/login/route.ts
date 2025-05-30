import { NextResponse } from "next/server"
import { validateUser, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const result = await validateUser(email, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    // Crear sesión
    await createSession(result.user)

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
