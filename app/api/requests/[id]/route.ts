import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendStatusUpdateEmail } from "@/lib/email"

// Obtener solicitud específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id

    const request = await db.request.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    return NextResponse.json(request)
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
    const currentRequest = await db.request.findUnique({
      where: {
        id: requestId
      }
    })

    if (!currentRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    const oldStatus = currentRequest.status

    // Actualizar la solicitud
    const updatedRequest = await db.request.update({
      where: {
        id: requestId
      },
      data: {
        status,
        resolvedBy: status !== "Pendiente" ? resolvedByEmail : null,
        resolvedByEmail: status !== "Pendiente" ? resolvedByEmail : null,
        resolvedAt: status !== "Pendiente" ? new Date().toISOString() : null
      }
    })

    // Si el estado cambió, enviar email de notificación
    if (oldStatus !== status) {
      try {
        await sendStatusUpdateEmail(
          currentRequest.email,
          currentRequest.user || currentRequest.email.split("@")[0],
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
      request: updatedRequest,
    })
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json({ error: "Error al actualizar la solicitud" }, { status: 500 })
  }
}
