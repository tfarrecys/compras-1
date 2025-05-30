import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ["query"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

export const sql = neon(process.env.DATABASE_URL!)
