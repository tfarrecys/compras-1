import { neon, neonConfig } from '@neondatabase/serverless'
import { config } from './config'

// Configuración básica de Neon
neonConfig.fetchConnectionCache = true

// Cliente de base de datos con reintentos
async function createNeonClient() {
  let lastError = null
  
  for (let attempt = 1; attempt <= config.database.maxRetries; attempt++) {
    try {
      const sql = neon(config.database.url!)
      // Verificar conexión
      await sql`SELECT 1`
      console.log('Conexión a la base de datos establecida')
      return sql
    } catch (error) {
      lastError = error
      console.error(`Intento ${attempt} fallido:`, error)
      if (attempt < config.database.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, config.database.retryDelay))
      }
    }
  }
  
  throw new Error(`No se pudo conectar a la base de datos después de ${config.database.maxRetries} intentos. Último error: ${lastError}`)
}

// Crear y exportar el cliente
export const sql = await createNeonClient()

// Función helper para ejecutar queries con manejo de errores
export async function executeQuery(query: string, params?: any[]) {
  try {
    const startTime = Date.now()
    const result = params ? await sql.query(query, params) : await sql.query(query)
    const duration = Date.now() - startTime
    
    console.log(`Query ejecutado en ${duration}ms`)
    return { 
      success: true, 
      data: result,
      duration 
    }
  } catch (error) {
    console.error('Error ejecutando query:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido en la base de datos',
      details: error
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
