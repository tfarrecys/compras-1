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
    const body = await request.json()
    
    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "ID y estado son requeridos" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('requests')
      .update({
        status: body.status,
        resolved_by: body.resolvedBy || null,
        resolved_by_email: body.resolvedByEmail || null,
        resolved_at: body.resolvedAt ? new Date(body.resolvedAt).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error al actualizar solicitud:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la solicitud' },
      { status: 500 }
    )
  }
}
