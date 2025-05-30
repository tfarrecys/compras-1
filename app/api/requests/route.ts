import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

// Obtener solicitudes
export async function GET() {
  try {
    console.log("Iniciando obtención de solicitudes...")
    
    // Asegurarnos de que la tabla existe
    await initializeDatabase()

    // Obtener solicitudes con reintentos
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      try {
        const requests = await sql`
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
            resolved_by as "resolvedBy",
            resolved_by_email as "resolvedByEmail",
            resolved_at as "resolvedAt",
            username as "user",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM requests 
          ORDER BY created_at DESC
        `
        console.log(`Solicitudes obtenidas exitosamente: ${requests.length}`)
        return NextResponse.json(requests)
      } catch (error) {
        attempts++
        console.error(`Intento ${attempts} fallido:`, error)
        if (attempts === maxAttempts) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
      }
    }
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

    // Insertar solicitud con reintentos
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      try {
        const result = await sql`
          INSERT INTO requests (
            id, email, sector, category, priority, description,
            quantity, budget, observations, date, status, username,
            created_at, updated_at
          ) VALUES (
            ${data.id}, ${data.email}, ${data.sector}, ${data.category || null},
            ${data.priority || null}, ${data.description}, ${data.quantity || null},
            ${data.budget || null}, ${data.observations || null}, ${data.date},
            'Pendiente', ${data.user || null}, NOW(), NOW()
          )
          RETURNING 
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
            resolved_by as "resolvedBy",
            resolved_by_email as "resolvedByEmail",
            resolved_at as "resolvedAt",
            username as "user",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `
        console.log("Solicitud creada exitosamente:", { id: result[0].id })
        return NextResponse.json(result[0])
      } catch (error) {
        attempts++
        console.error(`Intento ${attempts} fallido:`, error)
        if (attempts === maxAttempts) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
      }
    }
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
export async function PUT(req: Request) {
  try {
    console.log("Iniciando actualización de solicitud...")
    
    const data = await req.json()
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

    // Actualizar solicitud con reintentos
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      try {
        const result = await sql`
          UPDATE requests
          SET 
            status = ${data.status},
            resolved_by = ${data.resolvedBy || null},
            resolved_by_email = ${data.resolvedByEmail || null},
            resolved_at = ${data.resolvedAt || null},
            updated_at = NOW()
          WHERE id = ${data.id}
          RETURNING 
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
            resolved_by as "resolvedBy",
            resolved_by_email as "resolvedByEmail",
            resolved_at as "resolvedAt",
            username as "user",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `

        if (result.length === 0) {
          console.warn("Solicitud no encontrada para actualización:", { id: data.id })
          return NextResponse.json(
            { error: "Solicitud no encontrada" },
            { status: 404 }
          )
        }

        console.log("Solicitud actualizada exitosamente:", { 
          id: result[0].id, 
          newStatus: result[0].status 
        })
        return NextResponse.json(result[0])
      } catch (error) {
        attempts++
        console.error(`Intento ${attempts} fallido:`, error)
        if (attempts === maxAttempts) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
      }
    }
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
