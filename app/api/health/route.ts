import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const result = await sql`SELECT NOW()`
    
    return NextResponse.json({ 
      status: 'ok',
      time: result[0].now,
      message: 'Conexión a Neon establecida correctamente'
    })
  } catch (error) {
    console.error('Error de conexión:', error)
    return NextResponse.json({ 
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
} 