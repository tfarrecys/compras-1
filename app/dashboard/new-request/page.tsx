"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export default function NewRequestPage() {
  const [email, setEmail] = useState("")
  const [sector, setSector] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [quantity, setQuantity] = useState("")
  const [budget, setBudget] = useState("")
  const [observations, setObservations] = useState("")
  const [description, setDescription] = useState("")
  const [details, setDetails] = useState("")
  const [urgency, setUrgency] = useState("")
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
      const userEmail = localStorage.getItem("userEmail") || email

      // Create new request object
      const newRequest = {
        id: `REQ-${Date.now()}`,
        email: userEmail,
        sector,
        category,
        priority,
        description,
        quantity,
        budget,
        observations,
        date: new Date().toISOString().split("T")[0],
        status: "Pendiente",
      }

      // Get existing requests from localStorage
      const existingRequests = JSON.parse(localStorage.getItem("requests") || "[]")

      // Add new request
      existingRequests.push(newRequest)

      // Save back to localStorage
      localStorage.setItem("requests", JSON.stringify(existingRequests))

      // Send email notification to admin
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "new-request",
            requestId: newRequest.id,
            userEmail: userEmail,
            userName: localStorage.getItem("userName") || "Usuario",
            description: description,
            sector: sector,
            category: category,
            priority: priority,
          }),
        })

        toast({
          title: "📧 Notificación enviada",
          description: "Se ha notificado al departamento de compras sobre su nueva solicitud.",
          duration: 3000,
        })
      } catch (error) {
        console.error("Error sending email notification:", error)
        toast({
          title: "⚠️ Advertencia",
          description: "Solicitud creada, pero no se pudo enviar la notificación por email.",
          duration: 4000,
        })
      }

      toast({
        title: "✅ Solicitud enviada",
        description: `Su solicitud ${newRequest.id} ha sido enviada correctamente. Redirigiendo...`,
        duration: 4000,
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo enviar la solicitud. Intente nuevamente.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-blue-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Sistema de Compras
          </div>
          <Button variant="ghost" onClick={() => router.back()} className="ml-auto text-blue-700 hover:bg-blue-100">
            Volver
          </Button>
        </div>
      </header>
      <main className="flex-1 container px-4 py-6 sm:px-6">
        <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Nueva Solicitud de Compra</CardTitle>
            <CardDescription className="text-blue-700">
              Complete el formulario para enviar una nueva solicitud de compra
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-800">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="su.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-blue-800">
                    Sector *
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-blue-800">
                    Categoría *
                  </Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Tipo de producto/servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Materiales de Oficina">Materiales de Oficina</SelectItem>
                      <SelectItem value="Equipos Informáticos">Equipos Informáticos</SelectItem>
                      <SelectItem value="Herramientas">Herramientas</SelectItem>
                      <SelectItem value="Materiales de Construcción">Materiales de Construcción</SelectItem>
                      <SelectItem value="Insumos Tienda">Insumos Tienda</SelectItem>
                      <SelectItem value="Insumos Playa">Insumos Playa</SelectItem>
                      <SelectItem value="Servicios">Servicios</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-blue-800">
                    Prioridad *
                  </Label>
                  <Select value={priority} onValueChange={setPriority} required>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Nivel de urgencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-blue-800">
                  Descripción del producto/servicio *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describa detalladamente lo que necesita comprar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-blue-800">
                    Cantidad estimada
                  </Label>
                  <Input
                    id="quantity"
                    placeholder="ej: 10 unidades, 5 metros, etc."
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-blue-800">
                    Presupuesto estimado
                  </Label>
                  <Input
                    id="budget"
                    placeholder="ej: $50,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations" className="text-blue-800">
                  Observaciones adicionales
                </Label>
                <Textarea
                  id="observations"
                  placeholder="Información adicional, especificaciones técnicas, proveedores sugeridos, etc."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Solicitud"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
