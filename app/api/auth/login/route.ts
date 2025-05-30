import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Verificar si es un admin predefinido
    const adminCredentials = [
      { email: "admin@compras.com", password: "admin123", name: "Administrador Principal", role: "admin" },
      { email: "compras@empresa.com", password: "compras123", name: "Gestor de Compras", role: "admin" },
      { email: "supervisor@compras.com", password: "super123", name: "Supervisor de Compras", role: "admin" },
    ]

    const admin = adminCredentials.find((admin) => admin.email === email && admin.password === password)

    if (admin) {
      return NextResponse.json({
        success: true,
        user: {
          id: admin.email,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      })
    }

    // Buscar usuario en la base de datos
    const users = await sql`
      SELECT id, name, email, password, sector, role 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const user = users[0]

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
