import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendNewRequestEmail } from "@/lib/email"
import { cookies } from "next/headers"

// Obtener solicitudes
export async function GET() {
  try {
    const requests = await sql`
      SELECT * FROM requests 
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Crear nueva solicitud
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar campos requeridos
    if (!data.id || !data.email || !data.sector || !data.description) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (id, email, sector, description)" },
        { status: 400 }
      )
    }

    // Insertar nueva solicitud
    const result = await sql`
      INSERT INTO requests (
        id, email, sector, category, priority, description, 
        quantity, budget, observations, date, status, user,
        "createdAt", "updatedAt"
      ) VALUES (
        ${data.id}, ${data.email}, ${data.sector}, ${data.category}, ${data.priority}, ${data.description},
        ${data.quantity}, ${data.budget}, ${data.observations}, ${data.date}, ${data.status}, ${data.user},
        NOW(), NOW()
      )
      RETURNING *
    `

    // Enviar notificación por email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "new-request",
          requestId: data.id,
          userEmail: data.email,
          userName: data.user || "Usuario",
          description: data.description,
          sector: data.sector,
          category: data.category,
          priority: data.priority,
        }),
      })
    } catch (error) {
      console.error("Error sending email notification:", error)
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Actualizar solicitud
export async function PUT(req: Request) {
  try {
    const data = await req.json()
    
    const request = await sql`
      UPDATE requests
      SET status = ${data.status},
          resolvedBy = ${data.resolvedBy},
          resolvedByEmail = ${data.resolvedByEmail},
          resolvedAt = ${data.resolvedAt}
      WHERE id = ${data.id}
      RETURNING *
    `

    return NextResponse.json(request[0])
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      { error: "Error al actualizar la solicitud" },
      { status: 500 }
    )
  }
}
