import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { sendNewRequestEmail } from "@/lib/email"
import { cookies } from "next/headers"

// Obtener solicitudes
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM requests ORDER BY "createdAt" DESC'
    )
    return NextResponse.json(result.rows)
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
    const result = await pool.query(
      `INSERT INTO requests (
        id, email, sector, category, priority, description, 
        quantity, budget, observations, date, status, user,
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        data.id,
        data.email,
        data.sector,
        data.category,
        data.priority,
        data.description,
        data.quantity,
        data.budget,
        data.observations,
        data.date,
        data.status || 'Pendiente',
        data.user
      ]
    )

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

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Actualizar solicitud
export async function PUT(req: Request) {
  try {
    const data = await req.json()
    
    const result = await pool.query(
      `UPDATE requests
       SET status = $1,
           resolvedBy = $2,
           resolvedByEmail = $3,
           resolvedAt = $4,
           "updatedAt" = NOW()
       WHERE id = $5
       RETURNING *`,
      [data.status, data.resolvedBy, data.resolvedByEmail, data.resolvedAt, data.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
