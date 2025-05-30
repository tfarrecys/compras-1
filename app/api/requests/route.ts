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

    console.log('Parámetros de búsqueda:', { email, userType })

    // Construir la consulta base
    let queryText = 'SELECT * FROM requests'
    const queryParams = []

    // Si no es admin y hay email, filtrar por email
    if (userType !== 'admin' && email) {
      queryText += ' WHERE email = $1'
      queryParams.push(email)
    }

    // Ordenar por fecha de creación
    queryText += ' ORDER BY created_at DESC'

    console.log('Ejecutando consulta:', { queryText, queryParams })
    const result = await sql.query(queryText, queryParams)
    console.log(`Solicitudes encontradas: ${result.length}`)

    return NextResponse.json(result)
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

    const queryText = `
      INSERT INTO requests (
        id, email, sector, category, priority, description,
        quantity, budget, observations, date, status, username,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    const queryParams = [
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

    console.log('Ejecutando inserción:', { queryText, params: queryParams })
    const result = await sql.query(queryText, queryParams)
    console.log("Solicitud creada:", result[0])

    return NextResponse.json(result[0])
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

    const queryText = `
      UPDATE requests
      SET 
        status = $1,
        resolved_by = $2,
        resolved_by_email = $3,
        resolved_at = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `

    const queryParams = [
      data.status,
      data.resolvedBy || null,
      data.resolvedByEmail || null,
      data.resolvedAt ? new Date(data.resolvedAt) : null,
      data.id
    ]

    console.log('Ejecutando actualización:', { queryText, params: queryParams })
    const result = await sql.query(queryText, queryParams)

    if (!result || result.length === 0) {
      console.warn("Solicitud no encontrada para actualización:", { id: data.id })
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    console.log("Solicitud actualizada:", result[0])
    return NextResponse.json(result[0])
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
