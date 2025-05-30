import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendNewRequestEmail } from "@/lib/email"

// Obtener solicitudes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("user")

    let requests

    if (userEmail) {
      // Obtener solicitudes de un usuario específico
      requests = await sql`
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM requests r
        JOIN users u ON r.user_id = u.id
        WHERE u.email = ${userEmail}
        ORDER BY r.created_at DESC
      `
    } else {
      // Obtener todas las solicitudes (para admin)
      requests = await sql`
        SELECT r.*, u.name as user_name, u.email as user_email,
               admin.name as resolved_by_name
        FROM requests r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN users admin ON r.resolved_by_id = admin.id
        ORDER BY r.created_at DESC
      `
    }

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json({ error: "Error al obtener las solicitudes" }, { status: 500 })
  }
}

// Crear nueva solicitud
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { email, sector, category, priority, description, quantity, budget, observations } = data

    // Validar datos requeridos
    if (!email || !sector || !category || !priority || !description) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Buscar el usuario
    const users = await sql`
      SELECT id, name FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = users[0]

    // Generar ID de solicitud único
    const requestId = `REQ-${Date.now()}`

    // Crear la solicitud
    const newRequest = await sql`
      INSERT INTO requests (
        request_id, user_id, description, sector, category, priority, 
        quantity, budget, observations, status
      )
      VALUES (
        ${requestId}, ${user.id}, ${description}, ${sector}, ${category}, 
        ${priority}, ${quantity || null}, ${budget || null}, ${observations || null}, 'Pendiente'
      )
      RETURNING *
    `

    // Enviar email de notificación a admin
    try {
      await sendNewRequestEmail(requestId, email, user.name, description, sector, category, priority)
    } catch (error) {
      console.error("Error sending new request email:", error)
      // No fallar la creación si el email falla
    }

    return NextResponse.json({
      success: true,
      request: {
        ...newRequest[0],
        user_name: user.name,
        user_email: email,
      },
    })
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json({ error: "Error al crear la solicitud" }, { status: 500 })
  }
}
