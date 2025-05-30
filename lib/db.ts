import { neon, neonConfig } from '@neondatabase/serverless'
import { config } from './config'

// Configuración de Neon para entorno serverless
neonConfig.fetchConnectionCache = true
neonConfig.wsProxy = config.isProduction ? 'wss://proxy.neon.tech' : undefined
neonConfig.useSecureWebSocket = config.isProduction
neonConfig.pipelineConnect = config.isProduction
neonConfig.forceDisablePgBouncer = true

let sqlClient: any = null

// Cliente de base de datos con reintentos y pooling
async function createNeonClient() {
  if (sqlClient) return sqlClient

  let lastError = null
  
  for (let attempt = 1; attempt <= config.database.maxRetries; attempt++) {
    try {
      if (!config.database.url) {
        throw new Error('DATABASE_URL no está definida')
      }

      const sql = neon(config.database.url)
      // Verificar conexión
      await sql`SELECT 1`
      console.log('Conexión a Neon DB establecida correctamente')
      sqlClient = sql
      return sql
    } catch (error) {
      lastError = error
      console.error(`Intento ${attempt} de conexión fallido:`, error)
      if (attempt < config.database.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, config.database.retryDelay))
      }
    }
  }
  
  throw new Error(`No se pudo conectar a Neon DB después de ${config.database.maxRetries} intentos. Último error: ${lastError}`)
}

// Crear y exportar el cliente
export const sql = await createNeonClient()

// Función helper para ejecutar queries con manejo de errores y reconexión
export async function executeQuery(query: string, params?: any[]) {
  try {
    const startTime = Date.now()
    
    // Intentar reconectar si es necesario
    if (!sqlClient) {
      await createNeonClient()
    }
    
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
    
    // Si es error de conexión, intentar reconectar
    if (error instanceof Error && error.message.includes('connection')) {
      sqlClient = null // Forzar reconexión en el próximo intento
    }
    
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
    const startTime = Date.now()
    const result = await sql`SELECT 1 + 1 AS result`
    const duration = Date.now() - startTime
    console.log(`Conexión a Neon DB verificada (${duration}ms):`, result)
    return true
  } catch (error) {
    console.error('Error al conectar con Neon DB:', error)
    return false
  }
}
