import { PrismaClient } from "@prisma/client"
import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  log: ["query"],
})

if (process.env.NODE_ENV !== "production") global.prisma = prisma

// Configurar SSL y cache para Neon
neonConfig.fetchConnectionCache = true
neonConfig.useSecureWebSocket = true // Forzar WebSocket seguro
neonConfig.pipelineTLS = true // Optimizar conexión TLS

// Configuración del pool de conexiones
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  maxConnections: 10, // Limitar conexiones máximas
  connectionTimeoutMillis: 10000, // Timeout de 10 segundos
  idleTimeoutMillis: 60000 // Timeout de conexiones inactivas
})

// Función helper para ejecutar queries
export async function executeQuery(query: string, params?: any[]) {
  try {
    const result = await pool.query(query, params)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error('Error executing query:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido en la base de datos'
    }
  }
}

export { prisma, pool }
