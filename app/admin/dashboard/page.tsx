"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AdminNav } from "@/components/admin-nav"
import { AdminRequestTable } from "@/components/admin-request-table"
import { toast } from "@/components/ui/use-toast"
import { Filter, X } from "lucide-react"
import Link from "next/link"

interface Request {
  id: string
  status: string
  sector: string
  email: string
  description: string
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [isClient, setIsClient] = useState(false)

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

  const statuses = ["Pendiente", "En Revisión", "Aprobado", "Rechazado", "Finalizado"]

  useEffect(() => {
    setIsClient(true)
    const allRequests = JSON.parse(window?.localStorage?.getItem("requests") || "[]")
    setRequests(allRequests)
    setFilteredRequests(allRequests)
  }, [])

  useEffect(() => {
    let filtered = [...requests]

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    // Filtrar por sector
    if (sectorFilter !== "all") {
      filtered = filtered.filter((request) => request.sector === sectorFilter)
    }

    setFilteredRequests(filtered)
  }, [requests, statusFilter, sectorFilter])

  const updateRequestStatus = async (id: string, newStatus: string) => {
    if (!window?.localStorage) return

    const currentAdmin = window.localStorage.getItem("userName") || "Administrador"
    const adminEmail = window.localStorage.getItem("userEmail") || "admin@compras.com"

    const updatedRequests = requests.map((request) => {
      if (request.id === id) {
        return {
          ...request,
          status: newStatus,
          resolvedBy: newStatus !== "Pendiente" ? currentAdmin : undefined,
          resolvedByEmail: newStatus !== "Pendiente" ? adminEmail : undefined,
          resolvedAt: newStatus !== "Pendiente" ? new Date().toISOString() : undefined,
        }
      }
      return request
    })

    setRequests(updatedRequests)
    window.localStorage.setItem("requests", JSON.stringify(updatedRequests))

    // Find the updated request to get user details
    const updatedRequest = updatedRequests.find((req) => req.id === id)

    if (updatedRequest) {
      // Send email notification to user
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "status-update",
            userEmail: updatedRequest.email,
            userName: updatedRequest.email.split("@")[0], // Extract name from email
            requestId: id,
            newStatus: newStatus,
            requestDescription: updatedRequest.description,
          }),
        })

        toast({
          title: "📧 Notificación enviada",
          description: `Se ha notificado al usuario sobre el cambio de estado por ${currentAdmin}.`,
          duration: 3000,
        })
      } catch (error) {
        console.error("Error sending status update email:", error)
        toast({
          title: "⚠️ Advertencia",
          description: "Estado actualizado, pero no se pudo enviar la notificación por email.",
          duration: 4000,
        })
      }
    }

    // Show success message
    toast({
      title: "✅ Estado actualizado",
      description: `El estado de la solicitud ${id} ha sido actualizado por ${currentAdmin}`,
      duration: 4000,
    })
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setSectorFilter("all")
    toast({
      title: "🔄 Filtros limpiados",
      description: "Se han eliminado todos los filtros aplicados.",
      duration: 2000,
    })
  }

  if (!isClient) {
    return <div>Cargando...</div>
  }

  const hasActiveFilters = statusFilter !== "all" || sectorFilter !== "all"

  // Filtrar solicitudes activas (excluir finalizadas) para la pestaña "Todas"
  const activeRequests = filteredRequests.filter((request) => request.status !== "Finalizado")
  const finishedRequests = filteredRequests.filter((request) => request.status === "Finalizado")

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-blue-900 hover:text-blue-700">
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
          </Link>
          <AdminNav />
        </div>
      </header>
      <main className="flex-1 container px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-blue-900">Panel de Compras</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total de Solicitudes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{requests.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Sin Revisar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {requests.filter((r) => r.status === "Pendiente").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">En Proceso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {requests.filter((r) => r.status === "En Revisión").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Finalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "Finalizado").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4 bg-white/70 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Filtros:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-white/70 border border-blue-200">
              <TabsTrigger value="active" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                Activas
              </TabsTrigger>
              <TabsTrigger
                value="finished"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
              >
                Finalizadas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <AdminRequestTable requests={activeRequests} onStatusUpdate={updateRequestStatus} />
            </TabsContent>
            <TabsContent value="finished">
              <AdminRequestTable requests={finishedRequests} onStatusUpdate={updateRequestStatus} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
