"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, Clock } from "lucide-react"

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState(null)
  const [status, setStatus] = useState("")
  const [comments, setComments] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/requests/${params.id}`)
        if (!response.ok) throw new Error("Error al cargar la solicitud")
        const data = await response.json()
        setRequest(data)
        setStatus(data.status)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la solicitud",
          variant: "destructive",
        })
      }
    }

    fetchRequest()
  }, [params.id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const currentAdmin = localStorage.getItem("userName") || "Administrador"
      const adminEmail = localStorage.getItem("userEmail") || "admin@compras.com"

      const response = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          resolvedByEmail: adminEmail,
          comments
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado")
      }

      const updatedRequest = await response.json()
      setRequest(updatedRequest.request)

      toast({
        title: "Estado actualizado",
        description: `El estado de la solicitud ha sido actualizado por ${currentAdmin}`,
      })

      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)

    try {
      const currentAdmin = localStorage.getItem("userName") || "Administrador"
      const adminEmail = localStorage.getItem("userEmail") || "admin@compras.com"

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: params.id,
          senderEmail: adminEmail,
          content: newMessage,
          senderType: "admin"
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el mensaje")
      }

      const result = await response.json()
      setMessages([...messages, result.message])
      setNewMessage("")

      toast({
        title: "Mensaje enviado",
        description: `Su mensaje ha sido enviado al usuario por ${currentAdmin}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pendiente":
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
            Pendiente
          </Badge>
        )
      case "En Revisión":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            En Revisión
          </Badge>
        )
      case "Aprobado":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">Aprobado</Badge>
      case "Rechazado":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            Rechazado
          </Badge>
        )
      case "Finalizado":
        return (
          <Badge variant="default" className="bg-blue-600 text-white">
            Finalizado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-blue-900">Cargando...</div>
      </div>
    )
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
            Panel de Administración
          </div>
          <Button variant="ghost" onClick={() => router.back()} className="ml-auto text-blue-700 hover:bg-blue-100">
            Volver
          </Button>
        </div>
      </header>
      <main className="flex-1 container px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Request Details and Status Update */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-900">Solicitud #{params.id}</CardTitle>
                    <CardDescription className="text-blue-700">Detalles de la solicitud de compra</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Solicitante</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Sector</h3>
                    <p className="text-sm text-gray-600">{request.sector}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Categoría</h3>
                    <p className="text-sm text-gray-600">{request.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Prioridad</h3>
                    <p className="text-sm text-gray-600">{request.priority}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Fecha</h3>
                    <p className="text-sm text-gray-600">{request.date}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Presupuesto</h3>
                    <p className="text-sm text-gray-600">{request.budget || "No especificado"}</p>
                  </div>
                </div>

                {/* Información del administrador que resolvió */}
                {request.resolvedBy && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Resuelto por:</span>
                      <span className="text-blue-700">{request.resolvedBy}</span>
                    </div>
                    {request.resolvedAt && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600">{new Date(request.resolvedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-blue-800">Descripción</h3>
                  <p className="text-sm text-gray-600">{request.description}</p>
                </div>

                {request.quantity && (
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Cantidad</h3>
                    <p className="text-sm text-gray-600">{request.quantity}</p>
                  </div>
                )}

                {request.observations && (
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Observaciones</h3>
                    <p className="text-sm text-gray-600">{request.observations}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Update Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Actualizar Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-blue-800">
                      Estado
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Revisión">En Revisión</SelectItem>
                        <SelectItem value="Aprobado">Aprobado</SelectItem>
                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                        <SelectItem value="Finalizado">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments" className="text-blue-800">
                      Comentarios internos
                    </Label>
                    <Textarea
                      id="comments"
                      placeholder="Comentarios internos sobre esta solicitud..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? "Actualizando..." : "Actualizar Estado"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Comunicación con Usuario</CardTitle>
              <CardDescription className="text-blue-700">Intercambie mensajes con el solicitante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-blue-600 text-center py-4">
                    No hay mensajes aún. Envíe un mensaje para comenzar la conversación.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.senderType === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.senderType === "admin" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={
                              message.senderType === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                            }
                          >
                            {message.senderType === "admin" ? "A" : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.senderType === "admin" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm font-medium">{message.sender}</p>
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderType === "admin" ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex gap-2">
                <Textarea
                  placeholder="Escriba su mensaje al usuario..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={2}
                  className="flex-1 border-blue-200 focus:border-blue-400"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
