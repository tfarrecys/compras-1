import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

// Obtener solicitudes
export async function GET(request: Request) {
  try {
    console.log("Iniciando obtención de solicitudes...")

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userType = searchParams.get('userType')

    console.log('Parámetros de búsqueda:', { email, userType })

    let query = 'SELECT * FROM requests'
    const values: any[] = []

    if (userType !== 'admin' && email) {
      query += ' WHERE email = $1'
      values.push(email)
    }

    query += ' ORDER BY created_at DESC'

    const result = await sql.query(query, values)
    console.log(`Solicitudes encontradas: ${result.length}`)

    // Transformar los resultados
    const transformedRequests = result.map(req => ({
      id: req.id,
      email: req.email,
      sector: req.sector,
      category: req.category,
      priority: req.priority,
      description: req.description,
      quantity: req.quantity,
      budget: req.budget,
      observations: req.observations,
      date: req.date,
      status: req.status,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      resolvedAt: req.resolved_at,
      resolvedBy: req.resolved_by,
      resolvedByEmail: req.resolved_by_email,
      user: req.username
    }))

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

    const query = `
      INSERT INTO requests (
        id, email, sector, category, priority, description,
        quantity, budget, observations, date, status, username,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `

    const values = [
      data.id,
      data.email,
      data.sector,
      data.category || null,
      data.priority || null,
      data.description,
      data.quantity ? parseInt(data.quantity) : null,
      data.budget ? parseFloat(data.budget) : null,
      data.observations || null,
      data.date ? new Date(data.date) : new Date(),
      'Pendiente',
      data.user || null
    ]

    const result = await sql.query(query, values)
    console.log("Solicitud creada:", result[0].id)

    // Transformar el resultado
    const transformedResult = {
      id: result[0].id,
      email: result[0].email,
      sector: result[0].sector,
      category: result[0].category,
      priority: result[0].priority,
      description: result[0].description,
      quantity: result[0].quantity,
      budget: result[0].budget,
      observations: result[0].observations,
      date: result[0].date,
      status: result[0].status,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
      resolvedAt: result[0].resolved_at,
      resolvedBy: result[0].resolved_by,
      resolvedByEmail: result[0].resolved_by_email,
      user: result[0].username
    }

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

    const query = `
      UPDATE requests
      SET 
        status = $1,
        resolved_by = $2,
        resolved_by_email = $3,
        resolved_at = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `

    const values = [
      data.status,
      data.resolvedBy || null,
      data.resolvedByEmail || null,
      data.resolvedAt ? new Date(data.resolvedAt) : null,
      data.id
    ]

    const result = await sql.query(query, values)

    if (!result || result.length === 0) {
      console.warn("Solicitud no encontrada para actualización:", { id: data.id })
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    // Transformar el resultado
    const transformedResult = {
      id: result[0].id,
      email: result[0].email,
      sector: result[0].sector,
      category: result[0].category,
      priority: result[0].priority,
      description: result[0].description,
      quantity: result[0].quantity,
      budget: result[0].budget,
      observations: result[0].observations,
      date: result[0].date,
      status: result[0].status,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
      resolvedAt: result[0].resolved_at,
      resolvedBy: result[0].resolved_by,
      resolvedByEmail: result[0].resolved_by_email,
      user: result[0].username
    }

    console.log("Solicitud actualizada:", { 
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
