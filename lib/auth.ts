import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function validateUser(email: string, password: string) {
  try {
    // Verificar si es un admin predefinido
    const adminUsers = [
      { email: "admin@compras.com", password: "admin123", name: "Administrador Principal", role: "admin" },
      { email: "compras@empresa.com", password: "compras123", name: "Gestor de Compras", role: "admin" },
      { email: "supervisor@compras.com", password: "super123", name: "Supervisor de Compras", role: "admin" },
    ]

    const adminUser = adminUsers.find((admin) => admin.email === email)
    if (adminUser && adminUser.password === password) {
      return {
        success: true,
        user: {
          id: adminUser.email,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      }
    }

    // Buscar usuario en la base de datos
    const users = await sql`
      SELECT id, name, email, password, role 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Credenciales incorrectas" }
    }

    const user = users[0]

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { success: false, error: "Credenciales incorrectas" }
    }

    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error("Error during login:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("user-token")
  
  if (!token) {
    return null
  }

  try {
    // Aquí podrías validar el token si lo necesitas
    return JSON.parse(token.value)
  } catch {
    return null
  }
}

export async function createSession(user: any) {
  const cookieStore = cookies()
  cookieStore.set("user-token", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function destroySession() {
  const cookieStore = cookies()
  cookieStore.delete("user-token")
}
