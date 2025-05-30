import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  log: ["query"],
})

if (process.env.NODE_ENV !== "production") global.prisma = prisma

const sql = neon(process.env.DATABASE_URL!)

export { prisma, sql }
