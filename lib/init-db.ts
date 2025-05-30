import { sql } from './db'

export async function initializeDatabase() {
  try {
    // Crear tabla requests si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        sector TEXT NOT NULL,
        category TEXT,
        priority TEXT,
        description TEXT NOT NULL,
        quantity TEXT,
        budget TEXT,
        observations TEXT,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pendiente',
        resolvedBy TEXT,
        resolvedByEmail TEXT,
        resolvedAt TEXT,
        user TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Base de datos inicializada correctamente')
    return true
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error)
    return false
  }
} 