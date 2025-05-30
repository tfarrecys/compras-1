import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

// Obtener solicitudes
export async function GET(request: Request) {
  try {
    console.log("Iniciando obtención de solicitudes...")
    
    // Asegurarnos de que la tabla existe
    await initializeDatabase()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userType = searchParams.get('userType')

    let query = sql`
      SELECT 
        id, 
        email, 
        sector, 
        category, 
        priority, 
        description,
        quantity, 
        budget, 
        observations, 
        date, 
        status,
        resolved_by,
        resolved_by_email,
        resolved_at,
        username,
        created_at,
        updated_at
      FROM requests 
    `

    // Si no es admin, filtrar por email
    if (userType !== 'admin' && email) {
      query = sql`
        ${query} WHERE email = ${email}
      `
    }

    // Ordenar por fecha de creación
    query = sql`
      ${query} ORDER BY created_at DESC
    `

    const requests = await query

    // Transformar los resultados
    const transformedRequests = requests.map(req => ({
      ...req,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      resolvedAt: req.resolved_at,
      resolvedBy: req.resolved_by,
      resolvedByEmail: req.resolved_by_email,
      user: req.username
    }))

    console.log(`Solicitudes obtenidas exitosamente: ${transformedRequests.length}`)
    return NextResponse.json(transformedRequests)
  } catch (error) {
    console.error("Error al obtener solicitudes:", error)
    return NextResponse.json(
      { 
        error: "Error al cargar las solicitudes",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}

// Crear nueva solicitud
export async function POST(request: Request) {
  try {
    console.log("Iniciando creación de solicitud...")
    
    // Asegurarnos de que la tabla existe
    await initializeDatabase()

    const data = await request.json()
    console.log("Datos recibidos:", { ...data, description: data.description?.substring(0, 50) + "..." })

    // Validar campos requeridos
    if (!data.id || !data.email || !data.sector || !data.description) {
      console.warn("Campos requeridos faltantes:", { 
        hasId: !!data.id, 
        hasEmail: !!data.email, 
        hasSector: !!data.sector, 
        hasDescription: !!data.description 
      })
      return NextResponse.json(
        { error: "Faltan campos requeridos (id, email, sector, description)" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO requests (
        id, email, sector, category, priority, description,
        quantity, budget, observations, date, status, username,
        created_at, updated_at
      ) VALUES (
        ${data.id}, 
        ${data.email}, 
        ${data.sector}, 
        ${data.category || null},
        ${data.priority || null}, 
        ${data.description}, 
        ${data.quantity ? parseInt(data.quantity) : null},
        ${data.budget ? parseFloat(data.budget) : null},
        ${data.observations || null}, 
        ${data.date ? new Date(data.date) : new Date()},
        'Pendiente', 
        ${data.user || null}, 
        NOW(), 
        NOW()
      )
      RETURNING *
    `
    
    // Transformar los datos antes de enviarlos
    const transformedResult = {
      ...result[0],
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
      resolvedAt: result[0].resolved_at,
      resolvedBy: result[0].resolved_by,
      resolvedByEmail: result[0].resolved_by_email,
      user: result[0].username
    }

    console.log("Solicitud creada exitosamente:", { id: transformedResult.id })
    return NextResponse.json(transformedResult)
  } catch (error) {
    console.error("Error al crear solicitud:", error)
    return NextResponse.json(
      { 
        error: "Error al crear la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}

// Actualizar solicitud
export async function PUT(request: Request) {
  try {
    console.log("Iniciando actualización de solicitud...")
    
    const data = await request.json()
    console.log("Datos de actualización:", { id: data.id, status: data.status })
    
    // Validar datos requeridos
    if (!data.id || !data.status) {
      console.warn("Campos requeridos faltantes para actualización:", {
        hasId: !!data.id,
        hasStatus: !!data.status
      })
      return NextResponse.json(
        { error: "ID y estado son requeridos" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE requests
      SET 
        status = ${data.status},
        resolved_by = ${data.resolvedBy || null},
        resolved_by_email = ${data.resolvedByEmail || null},
        resolved_at = ${data.resolvedAt ? new Date(data.resolvedAt) : null},
        updated_at = NOW()
      WHERE id = ${data.id}
      RETURNING *
    `

    if (result.length === 0) {
      console.warn("Solicitud no encontrada para actualización:", { id: data.id })
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    // Transformar los datos antes de enviarlos
    const transformedResult = {
      ...result[0],
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
      resolvedAt: result[0].resolved_at,
      resolvedBy: result[0].resolved_by,
      resolvedByEmail: result[0].resolved_by_email,
      user: result[0].username
    }

    console.log("Solicitud actualizada exitosamente:", { 
      id: transformedResult.id, 
      newStatus: transformedResult.status 
    })
    return NextResponse.json(transformedResult)
  } catch (error) {
    console.error("Error al actualizar solicitud:", error)
    return NextResponse.json(
      { 
        error: "Error al actualizar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}
