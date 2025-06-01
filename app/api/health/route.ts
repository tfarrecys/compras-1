import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db'

export async function GET() {
  try {
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'No se pudo conectar a la base de datos'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      status: 'ok',
      message: 'Conexión a la base de datos establecida'
    })
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error de conexión a la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 