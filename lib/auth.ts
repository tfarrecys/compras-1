import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Verificar si es un admin predefinido
        const adminUsers = [
          { email: "admin@compras.com", password: "admin123", name: "Administrador Principal", role: "admin" },
          { email: "compras@empresa.com", password: "compras123", name: "Gestor de Compras", role: "admin" },
          { email: "supervisor@compras.com", password: "super123", name: "Supervisor de Compras", role: "admin" },
        ]

        const adminUser = adminUsers.find((admin) => admin.email === credentials.email)
        if (adminUser && adminUser.password === credentials.password) {
          return {
            id: adminUser.email,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
          }
        }

        // Buscar usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
}

export const getSession = () => getServerSession(authOptions)
