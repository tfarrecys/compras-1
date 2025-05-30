import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/init-db'

export async function GET() {
  try {
    const success = await initializeDatabase()
    if (success) {
      return NextResponse.json({ message: 'Base de datos inicializada correctamente' })
    } else {
      return NextResponse.json(
        { error: 'Error al inicializar la base de datos' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 