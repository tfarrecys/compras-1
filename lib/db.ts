import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

declare global {
  var prisma: PrismaClient | undefined
}

const db = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") global.prisma = db

const sql = neon(process.env.DATABASE_URL!)

export { sql }
