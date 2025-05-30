import { neon, neonConfig } from '@neondatabase/serverless'

// Configuración básica de Neon
neonConfig.fetchConnectionCache = true

// Crear cliente de base de datos
const sql = neon(process.env.DATABASE_URL!)

// Función helper para ejecutar queries
export async function executeQuery(query: string, params?: any[]) {
  try {
    if (params) {
      const result = await sql.query(query, params)
      return { success: true, data: result }
    } else {
      const result = await sql.query(query)
      return { success: true, data: result }
    }
  } catch (error) {
    console.error('Error en la base de datos:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido en la base de datos'
    }
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 + 1 AS result`
    console.log('Conexión a la base de datos exitosa:', result)
    return true
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error)
    return false
  }
}

export { sql }
