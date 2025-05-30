import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// Obtener solicitudes
export async function GET() {
  try {
    const result = await executeQuery(
      'SELECT * FROM requests ORDER BY "createdAt" DESC'
    )

    if (!result.success) {
      console.error("Error al cargar solicitudes:", result.error)
      return NextResponse.json(
        { error: "Error al cargar las solicitudes", details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error en GET /api/requests:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
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

    // Insertar nueva solicitud
    const result = await executeQuery(
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
        data.category || null,
        data.priority || null,
        data.description,
        data.quantity || null,
        data.budget || null,
        data.observations || null,
        data.date,
        'Pendiente',
        data.user || null
      ]
    )

    if (!result.success) {
      console.error("Error al crear solicitud:", result.error)
      return NextResponse.json(
        { error: "Error al crear la solicitud", details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data[0])
  } catch (error) {
    console.error("Error en POST /api/requests:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Actualizar solicitud
export async function PUT(req: Request) {
  try {
    const data = await req.json()
    
    const result = await executeQuery(
      `UPDATE requests
       SET status = $1,
           resolvedBy = $2,
           resolvedByEmail = $3,
           resolvedAt = $4,
           "updatedAt" = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        data.status,
        data.resolvedBy || null,
        data.resolvedByEmail || null,
        data.resolvedAt || null,
        data.id
      ]
    )

    if (!result.success) {
      console.error("Error al actualizar solicitud:", result.error)
      return NextResponse.json(
        { error: "Error al actualizar la solicitud", details: result.error },
        { status: 500 }
      )
    }

    if (result.data.length === 0) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.data[0])
  } catch (error) {
    console.error("Error en PUT /api/requests:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
