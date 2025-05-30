import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/init-db'

export async function POST() {
  try {
    const success = await initializeDatabase()
    
    if (success) {
      return NextResponse.json({ 
        message: 'Base de datos reinicializada correctamente',
        success: true
      })
    } else {
      return NextResponse.json({ 
        error: 'Error al reinicializar la base de datos',
        success: false
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      success: false
    }, { status: 500 })
  }
} 