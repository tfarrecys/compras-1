import { Pool } from "@neondatabase/serverless"

// Configuración del pool de conexiones
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  maxConnections: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 60000
})

// Función helper para ejecutar queries
export async function executeQuery(query: string, params?: any[]) {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(query, params)
      return { success: true, data: result.rows }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error executing query:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido en la base de datos'
    }
  }
}

export { pool }
