import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendStatusUpdateEmail } from "@/lib/email"

// Obtener solicitud específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const requests = await sql`
      SELECT * FROM requests 
      WHERE id = ${id}
    `

    if (requests.length === 0) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    return NextResponse.json(requests[0])
  } catch (error) {
    console.error("Error fetching request:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Actualizar solicitud
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await request.json()

    const result = await sql`
      UPDATE requests
      SET status = ${data.status},
          resolvedBy = ${data.resolvedBy},
          resolvedByEmail = ${data.resolvedByEmail},
          resolvedAt = ${data.resolvedAt},
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Si el estado cambió, enviar email de notificación
    if (result[0].status !== data.status) {
      try {
        await sendStatusUpdateEmail(
          result[0].email,
          result[0].user || result[0].email.split("@")[0],
          id,
          data.status,
          result[0].description,
        )
      } catch (error) {
        console.error("Error sending status update email:", error)
        // No fallar la actualización si el email falla
      }
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const result = await sql`
      DELETE FROM requests 
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting request:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
