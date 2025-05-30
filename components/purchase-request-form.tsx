"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export function PurchaseRequestForm() {
  const [description, setDescription] = useState("")
  const [details, setDetails] = useState("")
  const [urgency, setUrgency] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Here you would implement actual request submission
      // For now, we'll simulate success

      toast({
        title: "Solicitud enviada",
        description: "Su solicitud de compra ha sido enviada correctamente",
      })

      // router.push("/dashboard") // Removed router to avoid extra import
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Solicitud de Compra</CardTitle>
        <CardDescription>Complete el formulario para enviar una nueva solicitud de compra</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descripción Breve</Label>
            <Input
              id="description"
              placeholder="Ej: Materiales de oficina"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Detalles de la Solicitud</Label>
            <Textarea
              id="details"
              placeholder="Describa detalladamente lo que necesita comprar..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Nivel de Urgencia</Label>
            <Select value={urgency} onValueChange={setUrgency} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el nivel de urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
