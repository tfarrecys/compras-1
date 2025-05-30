import { type NextRequest, NextResponse } from "next/server"
import { sendStatusUpdateEmail, sendNewRequestEmail, sendNewMessageEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    let result

    switch (type) {
      case "status-update":
        result = await sendStatusUpdateEmail(
          "tfarrerascys@gmail.com", // Todos los emails van a tu dirección
          data.userName,
          data.requestId,
          data.newStatus,
          data.requestDescription,
        )
        break

      case "new-request":
        result = await sendNewRequestEmail(
          data.requestId,
          "tfarrerascys@gmail.com", // Todos los emails van a tu dirección
          data.userName,
          data.description,
          data.sector,
          data.category,
          data.priority,
        )
        break

      case "new-message":
        result = await sendNewMessageEmail(
          "tfarrerascys@gmail.com", // Todos los emails van a tu dirección
          data.recipientName,
          data.senderName,
          data.messageContent,
          data.requestId,
          data.isToAdmin,
        )
        break

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in email API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
