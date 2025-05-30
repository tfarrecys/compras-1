import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Verificar conexión
    const startTime = Date.now()
    await sql`SELECT 1`
    const connectionTime = Date.now() - startTime

    // Obtener información de las tablas
    const tables = await sql`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
    `

    // Obtener estructura de la tabla requests
    const requestsColumns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'requests'
      ORDER BY ordinal_position
    `

    // Contar registros en la tabla requests
    let requestsCount = 0
    try {
      const result = await sql`SELECT COUNT(*) as count FROM requests`
      requestsCount = result[0].count
    } catch (error) {
      console.error('Error al contar registros:', error)
    }

    return NextResponse.json({
      connection: {
        status: 'connected',
        responseTime: `${connectionTime}ms`
      },
      tables: tables,
      requestsTable: {
        exists: requestsColumns.length > 0,
        columnCount: requestsColumns.length,
        columns: requestsColumns,
        recordCount: requestsCount
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Error al obtener información de la base de datos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
} 