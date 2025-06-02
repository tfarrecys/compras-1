import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

// Obtener solicitudes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userType = searchParams.get('userType')

    let query = supabase
      .from('requests')
      .select('*')

    // Si no es admin y hay email, filtrar por email
    if (userType !== 'admin' && email) {
      query = query.eq('email', email)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener solicitudes:', error)
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    )
  }
}

// Crear nueva solicitud
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('requests')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        status: 'Pendiente'
      }])
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error al crear solicitud:', error)
    return NextResponse.json(
      { error: 'Error al crear solicitud' },
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
