import { sql } from './db'
import { config } from './config'

export async function initializeDatabase() {
  console.log('Verificando base de datos en Neon...')
  
  try {
    // Verificar conexión
    await sql`SELECT 1`
    console.log('Conexión a Neon DB verificada')

    // Verificar si la tabla existe y crearla si no existe (sin eliminar datos)
    await sql`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        sector TEXT NOT NULL,
        category TEXT,
        priority TEXT,
        description TEXT NOT NULL,
        quantity INTEGER,
        budget DECIMAL,
        observations TEXT,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pendiente',
        resolved_by TEXT,
        resolved_by_email TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE,
        username TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Tabla requests verificada/creada correctamente')

    return true
  } catch (error) {
    console.error('Error en la verificación de la base de datos:', error)
    throw error
  }
} 