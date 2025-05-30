import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const start = Date.now()
    const result = await sql`SELECT 1 as health_check`
    const duration = Date.now() - start

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: `${duration}ms`,
        result: result[0]
      }
    })
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      },
      { status: 500 }
    )
  }
} 