"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get registered users from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if it's one of the admins
      const adminCredentials = [
        { email: "admin@compras.com", password: "admin123", name: "Administrador Principal" },
        { email: "compras@empresa.com", password: "compras123", name: "Gestor de Compras" },
        { email: "supervisor@compras.com", password: "super123", name: "Supervisor de Compras" },
      ]

      const admin = adminCredentials.find((admin) => admin.email === email && admin.password === password)

      if (admin) {
        localStorage.setItem("userType", "admin")
        localStorage.setItem("userEmail", email)
        localStorage.setItem("userName", admin.name)
        toast({
          title: "✅ Inicio de sesión exitoso",
          description: `Bienvenido ${admin.name}. Redirigiendo al panel de administración...`,
          duration: 3000,
        })
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 1500)
      } else {
        // Check if user exists and password matches
        const user = registeredUsers.find((u) => u.email === email && u.password === password)

        if (user) {
          localStorage.setItem("userType", "user")
          localStorage.setItem("userEmail", email)
          localStorage.setItem("userName", user.name)
          toast({
            title: "✅ Inicio de sesión exitoso",
            description: `Bienvenido ${user.name}. Redirigiendo a su panel...`,
            duration: 3000,
          })
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } else {
          throw new Error("Invalid credentials")
        }
      }
    } catch (error) {
      toast({
        title: "❌ Error de inicio de sesión",
        description: "Credenciales incorrectas. Verifique su email y contraseña.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-blue-900">Iniciar Sesión</CardTitle>
          <CardDescription className="text-blue-700">Ingrese sus credenciales para acceder a su cuenta</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-800">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-blue-800">
                  Contraseña
                </Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  ¿Olvidó su contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
                required
              />
            </div>

            {/* Información de cuentas de prueba */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Cuentas de prueba:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>
                  <strong>Admin Principal:</strong> admin@compras.com / admin123
                </div>
                <div>
                  <strong>Gestor de Compras:</strong> compras@empresa.com / compras123
                </div>
                <div>
                  <strong>Supervisor:</strong> supervisor@compras.com / super123
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <p className="mt-4 text-center text-sm text-blue-600">
              ¿No tiene una cuenta?{" "}
              <Link href="/register" className="font-medium text-blue-700 hover:underline">
                Registrarse
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
