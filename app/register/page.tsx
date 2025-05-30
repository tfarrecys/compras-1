"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sector, setSector] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const sectors = [
    "Chichinales",
    "R.Ruta",
    "R.Centro",
    "Roca",
    "Pacheco",
    "Esmeralda",
    "C.Saltos",
    "Agro Roca",
    "Agro Choele",
    "Casa Central",
    "Mantenimiento",
  ]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if user already exists
      const userExists = existingUsers.find((user) => user.email === email)
      if (userExists) {
        throw new Error("User already exists")
      }

      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, this would be hashed
        sector,
        createdAt: new Date().toISOString(),
      }

      // Add to users array
      existingUsers.push(newUser)

      // Save to localStorage
      localStorage.setItem("users", JSON.stringify(existingUsers))

      // Establecer cookies de autenticación
      Cookies.set("user-token", btoa(email), { expires: 7 })
      Cookies.set("user-type", "user", { expires: 7 })

      // Auto-login the user
      localStorage.setItem("userType", "user")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userName", name)

      toast({
        title: "✅ Registro exitoso",
        description: "Su cuenta ha sido creada correctamente. Redirigiendo al panel...",
        duration: 3000,
      })

      router.push("/dashboard")
    } catch (error) {
      if (error.message === "User already exists") {
        toast({
          title: "❌ Error de registro",
          description: "Ya existe una cuenta con este correo electrónico.",
          variant: "destructive",
          duration: 4000,
        })
      } else {
        toast({
          title: "❌ Error de registro",
          description: "No se pudo crear la cuenta. Intente nuevamente.",
          variant: "destructive",
          duration: 4000,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-blue-900">Crear Cuenta</CardTitle>
          <CardDescription className="text-blue-700">Ingrese sus datos para registrarse en el sistema</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-800">
                Nombre Completo
              </Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
                required
              />
            </div>
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
              <Label htmlFor="password" className="text-blue-800">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector" className="text-blue-800">
                Sector
              </Label>
              <Select value={sector} onValueChange={setSector} required>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Seleccione su sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
            <p className="mt-4 text-center text-sm text-blue-600">
              ¿Ya tiene una cuenta?{" "}
              <Link href="/login" className="font-medium text-blue-700 hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
