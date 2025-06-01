import { sql } from './db'

export async function initializeDatabase() {
  try {
    // Verificar conexión
    await sql.query('SELECT 1')
    console.log('Conexión a Neon DB verificada')

    // Crear tabla si no existe
    await sql.query(`
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
    `)

    // Verificar que la tabla se creó correctamente
    const tableInfo = await sql.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'requests'
      ORDER BY ordinal_position
    `)

    console.log('Estructura de la tabla requests:', tableInfo)
    return true
  } catch (error) {
    console.error('Error inicializando la base de datos:', error)
    throw error
  }
}

export const sql = {
  query: async (text: string, params?: any[]) => {
    try {
      const result = await sql.query(text, params)
      return result.rows
    } catch (error) {
      console.error('Error en consulta SQL:', error)
      throw error
    }
  }
} 