import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export const sql = {
  query: async (query: string, values?: any[]) => {
    try {
      const result = await pool.query(query, values)
      return result.rows
    } catch (error) {
      console.error('Error en la consulta SQL:', error)
      throw error
    }
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('Conexión a Neon DB verificada:', result.rows[0])
    return true
  } catch (error) {
    console.error('Error al conectar con Neon DB:', error)
    return false
  }
}
