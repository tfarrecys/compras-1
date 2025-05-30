import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["query"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

const sql = neon(process.env.DATABASE_URL!)

const db = prisma

export { db, sql }
