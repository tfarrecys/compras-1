import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { config } from '@/lib/config'

export async function GET() {
  const healthCheck = {
    status: 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    database: {
      connected: false,
      responseTime: null,
      error: null
    }
  }

  try {
    // Verificar conexión a la base de datos
    const start = Date.now()
    const result = await sql`SELECT 1 as health_check`
    const duration = Date.now() - start

    healthCheck.status = 'healthy'
    healthCheck.database = {
      connected: true,
      responseTime: `${duration}ms`,
      result: result[0]
    }

    // Verificar estructura de la tabla
    try {
      const tableInfo = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'requests'
        ) as table_exists
      `
      healthCheck.database.tableExists = tableInfo[0].table_exists
    } catch (error) {
      console.error('Error al verificar tabla:', error)
      healthCheck.database.tableError = 'Error al verificar estructura de la tabla'
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error)
    healthCheck.database.error = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      healthCheck,
      { status: 500 }
    )
  }
} 