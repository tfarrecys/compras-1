import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendNewRequestEmail } from "@/lib/email"
import { cookies } from "next/headers"

// Obtener solicitudes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userEmail = searchParams.get("email")
    const userType = searchParams.get("userType")

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email de usuario requerido" },
        { status: 400 }
      )
    }

    // Si es admin, devolver todas las solicitudes
    if (userType === "admin") {
      const requests = await db.request.findMany({
        orderBy: {
          date: "desc"
        }
      })
      return NextResponse.json(requests)
    }

    // Si es usuario normal, devolver solo sus solicitudes
    const requests = await db.request.findMany({
      where: {
        email: userEmail
      },
      orderBy: {
        date: "desc"
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json(
      { error: "Error al obtener las solicitudes" },
      { status: 500 }
    )
  }
}

// Crear nueva solicitud
export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Validar campos requeridos
    if (!data.email || !data.sector || !data.description) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: email, sector y descripción son obligatorios" },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      )
    }

    const request = await db.request.create({
      data: {
        id: data.id || `REQ-${Date.now()}`,
        email: data.email,
        sector: data.sector,
        category: data.category,
        priority: data.priority,
        description: data.description,
        quantity: data.quantity,
        budget: data.budget,
        observations: data.observations,
        date: data.date || new Date().toISOString().split("T")[0],
        status: "Pendiente",
        user: data.user
      }
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json(
      { error: "Error al crear la solicitud" },
      { status: 500 }
    )
  }
}

// Actualizar solicitud
export async function PUT(req: Request) {
  try {
    const data = await req.json()
    
    const request = await db.request.update({
      where: {
        id: data.id
      },
      data: {
        status: data.status,
        resolvedBy: data.resolvedBy,
        resolvedByEmail: data.resolvedByEmail,
        resolvedAt: data.resolvedAt
      }
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      { error: "Error al actualizar la solicitud" },
      { status: 500 }
    )
  }
}
