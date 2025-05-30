"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"

export default function UserRequestDetailPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    const allRequests = JSON.parse(localStorage.getItem("requests") || "[]")
    const foundRequest = allRequests.find((req) => req.id === params.id && req.email === userEmail)

    if (foundRequest) {
      setRequest(foundRequest)
      // Load messages for this request
      const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
      const requestMessages = allMessages.filter((msg) => msg.requestId === params.id)
      setMessages(requestMessages)
    }
  }, [params.id])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)

    try {
      const userName = localStorage.getItem("userName")
      const userEmail = localStorage.getItem("userEmail")

      const message = {
        id: Date.now().toString(),
        requestId: params.id,
        sender: userName,
        senderEmail: userEmail,
        senderType: "user",
        content: newMessage,
        timestamp: new Date().toISOString(),
      }

      // Get existing messages
      const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
      allMessages.push(message)
      localStorage.setItem("messages", JSON.stringify(allMessages))

      // Update local state
      setMessages([...messages, message])
      setNewMessage("")

      toast({
        title: "Mensaje enviado",
        description: "Su mensaje ha sido enviado al departamento de compras",
      })

      // Send email notification to admin about new message
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "new-message",
            recipientEmail: "admin@compras.com",
            recipientName: "Departamento de Compras",
            senderName: userName,
            messageContent: newMessage,
            requestId: params.id,
            isToAdmin: true,
          }),
        })
      } catch (error) {
        console.error("Error sending message notification email:", error)
      }
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
        return <Badge variant="outline">Pendiente</Badge>
      case "En Revisión":
        return <Badge variant="secondary">En Revisión</Badge>
      case "Aprobado":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aprobado</Badge>
      case "Rechazado":
        return <Badge variant="destructive">Rechazado</Badge>
      case "Finalizado":
        return <Badge variant="default">Finalizado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Solicitud no encontrada o no tiene permisos para verla</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
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
          <Button variant="ghost" onClick={() => router.back()} className="ml-auto">
            Volver
          </Button>
        </div>
      </header>
      <main className="flex-1 container px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Solicitud #{params.id}</CardTitle>
                  <CardDescription>Detalles de su solicitud de compra</CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Sector</h3>
                  <p className="text-sm text-gray-500">{request.sector}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Categoría</h3>
                  <p className="text-sm text-gray-500">{request.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Prioridad</h3>
                  <p className="text-sm text-gray-500">{request.priority}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Fecha</h3>
                  <p className="text-sm text-gray-500">{request.date}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Descripción</h3>
                <p className="text-sm text-gray-500">{request.description}</p>
              </div>

              {request.quantity && (
                <div>
                  <h3 className="text-sm font-medium">Cantidad estimada</h3>
                  <p className="text-sm text-gray-500">{request.quantity}</p>
                </div>
              )}

              {request.budget && (
                <div>
                  <h3 className="text-sm font-medium">Presupuesto estimado</h3>
                  <p className="text-sm text-gray-500">{request.budget}</p>
                </div>
              )}

              {request.observations && (
                <div>
                  <h3 className="text-sm font-medium">Observaciones</h3>
                  <p className="text-sm text-gray-500">{request.observations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comunicación con Compras</CardTitle>
              <CardDescription>Intercambie mensajes con el departamento de compras</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay mensajes aún. Envíe un mensaje para comenzar la conversación.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.senderType === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.senderType === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{message.senderType === "user" ? "U" : "A"}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.senderType === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderType === "user" ? "text-blue-100" : "text-gray-500"
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
                  placeholder="Escriba su mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !newMessage.trim()}>
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
