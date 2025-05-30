import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendStatusUpdateEmail } from "@/lib/email"

// Obtener solicitud específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id

    const requests = await sql`
      SELECT r.*, u.name as user_name, u.email as user_email,
             admin.name as resolved_by_name
      FROM requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users admin ON r.resolved_by_id = admin.id
      WHERE r.request_id = ${requestId}
    `

    if (requests.length === 0) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    return NextResponse.json(requests[0])
  } catch (error) {
    console.error("Error fetching request:", error)
    return NextResponse.json({ error: "Error al obtener la solicitud" }, { status: 500 })
  }
}

// Actualizar solicitud
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id
    const data = await request.json()
    const { status, resolvedByEmail } = data

    // Obtener la solicitud actual
    const currentRequests = await sql`
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.request_id = ${requestId}
    `

    if (currentRequests.length === 0) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    const currentRequest = currentRequests[0]
    const oldStatus = currentRequest.status

    // Buscar el admin que está resolviendo
    let resolvedById = null
    if (resolvedByEmail && status !== "Pendiente") {
      const admins = await sql`
        SELECT id FROM users WHERE email = ${resolvedByEmail} AND role = 'admin'
      `
      if (admins.length > 0) {
        resolvedById = admins[0].id
      }
    }

    // Actualizar la solicitud
    const updatedRequest = await sql`
      UPDATE requests 
      SET status = ${status},
          resolved_by_id = ${resolvedById},
          resolved_at = ${status !== "Pendiente" ? new Date().toISOString() : null},
          updated_at = CURRENT_TIMESTAMP
      WHERE request_id = ${requestId}
      RETURNING *
    `

    // Si el estado cambió, enviar email de notificación
    if (oldStatus !== status) {
      try {
        await sendStatusUpdateEmail(
          currentRequest.user_email,
          currentRequest.user_name,
          requestId,
          status,
          currentRequest.description,
        )
      } catch (error) {
        console.error("Error sending status update email:", error)
        // No fallar la actualización si el email falla
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest[0],
    })
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json({ error: "Error al actualizar la solicitud" }, { status: 500 })
  }
}
