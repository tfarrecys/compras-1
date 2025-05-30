import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendNewMessageEmail } from "@/lib/email"

// Obtener mensajes de una solicitud
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json({ error: "requestId es requerido" }, { status: 400 })
    }

    const messages = await sql`
      SELECT m.*, u.name as sender_name, u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      JOIN requests r ON m.request_id = r.id
      WHERE r.request_id = ${requestId}
      ORDER BY m.created_at ASC
    `

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Error al obtener los mensajes" }, { status: 500 })
  }
}

// Crear nuevo mensaje
export async function POST(request: Request) {
  try {
    const { requestId, senderEmail, content, senderType } = await request.json()

    // Validar datos requeridos
    if (!requestId || !senderEmail || !content || !senderType) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Buscar el usuario que envía
    const senders = await sql`
      SELECT id, name FROM users WHERE email = ${senderEmail}
    `

    if (senders.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const sender = senders[0]

    // Buscar la solicitud
    const requests = await sql`
      SELECT r.id, r.request_id, u.name as user_name, u.email as user_email
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.request_id = ${requestId}
    `

    if (requests.length === 0) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    const requestData = requests[0]

    // Crear el mensaje
    const newMessage = await sql`
      INSERT INTO messages (request_id, sender_id, sender_type, content)
      VALUES (${requestData.id}, ${sender.id}, ${senderType}, ${content})
      RETURNING *
    `

    // Determinar el destinatario del email
    const isToAdmin = senderType === "user"
    const recipientEmail = isToAdmin ? "admin@compras.com" : requestData.user_email
    const recipientName = isToAdmin ? "Departamento de Compras" : requestData.user_name

    // Enviar email de notificación
    try {
      await sendNewMessageEmail(recipientEmail, recipientName, sender.name, content, requestId, isToAdmin)
    } catch (error) {
      console.error("Error sending message notification email:", error)
      // No fallar la creación del mensaje si el email falla
    }

    return NextResponse.json({
      success: true,
      message: {
        ...newMessage[0],
        sender_name: sender.name,
        sender_email: senderEmail,
      },
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Error al crear el mensaje" }, { status: 500 })
  }
}
