import { NextResponse } from "next/server"
import { sql, testConnection } from "@/lib/db"

// Obtener solicitudes
export async function GET() {
  try {
    // Verificar conexión
    const isConnected = await testConnection()
    if (!isConnected) {
      console.error("No se pudo conectar a la base de datos")
      return NextResponse.json(
        { error: "Error de conexión a la base de datos" },
        { status: 500 }
      )
    }

    // Obtener solicitudes
    const requests = await sql`
      SELECT * FROM requests 
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error al obtener solicitudes:", error)
    return NextResponse.json(
      { error: "Error al cargar las solicitudes" },
      { status: 500 }
    )
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

    // Insertar solicitud
    const result = await sql`
      INSERT INTO requests (
        id, email, sector, category, priority, description,
        quantity, budget, observations, date, status, user,
        "createdAt", "updatedAt"
      ) VALUES (
        ${data.id}, ${data.email}, ${data.sector}, ${data.category || null},
        ${data.priority || null}, ${data.description}, ${data.quantity || null},
        ${data.budget || null}, ${data.observations || null}, ${data.date},
        'Pendiente', ${data.user || null}, NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al crear solicitud:", error)
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
    
    const result = await sql`
      UPDATE requests
      SET status = ${data.status},
          resolvedBy = ${data.resolvedBy || null},
          resolvedByEmail = ${data.resolvedByEmail || null},
          resolvedAt = ${data.resolvedAt || null},
          "updatedAt" = NOW()
      WHERE id = ${data.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al actualizar solicitud:", error)
    return NextResponse.json(
      { error: "Error al actualizar la solicitud" },
      { status: 500 }
    )
  }
}
