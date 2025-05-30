import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, password, sector } = await request.json()

    // Validar datos requeridos
    if (!name || !email || !password || !sector) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Ya existe una cuenta con este correo electrónico" }, { status: 400 })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const newUser = await sql`
      INSERT INTO users (name, email, password, sector, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${sector}, 'user')
      RETURNING id, name, email, sector, role
    `

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(email, name)
    } catch (error) {
      console.error("Error sending welcome email:", error)
      // No fallar el registro si el email falla
    }

    return NextResponse.json({
      success: true,
      user: newUser[0],
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
