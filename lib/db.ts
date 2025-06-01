import { Pool } from '@neondatabase/serverless'
import { createPool } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida')
}

const pool = createPool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  connectionTimeoutMillis: 5000,
  max: 20,
  idleTimeoutMillis: 30000,
  maxUses: 7500,
})

export const sql = {
  query: async (text: string, params?: any[]) => {
    try {
      const client = await pool.connect()
      try {
        const result = await client.query(text, params)
        return result.rows
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error en la conexión/consulta:', error)
      throw error
    }
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await sql.query('SELECT NOW()')
    console.log('Conexión a Neon DB exitosa:', result)
    return true
  } catch (error) {
    console.error('Error al conectar con Neon DB:', error)
    return false
  }
}
