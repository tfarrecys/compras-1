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

// Configurar SSL para Neon
neonConfig.fetchConnectionCache = true

const sql = neon(process.env.DATABASE_URL!)
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export { prisma, sql, pool }
