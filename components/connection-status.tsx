"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setIsConnected(data.status === "healthy")
        
        if (data.status !== "healthy") {
          toast({
            title: "⚠️ Problema de conexión",
            description: "No se pudo establecer conexión con el servidor",
            variant: "destructive",
          })
        }
      } catch (error) {
        setIsConnected(false)
        toast({
          title: "❌ Error de conexión",
          description: "No se pudo verificar la conexión con el servidor",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Verificar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 p-2 rounded-full shadow-lg">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-2 rounded-full shadow-lg">
      <div className={`h-4 w-4 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
    </div>
  )
} 