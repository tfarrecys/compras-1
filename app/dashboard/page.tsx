"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserNav } from "@/components/user-nav"
import { RequestTable } from "@/components/request-table"

export default function DashboardPage() {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    const allRequests = JSON.parse(localStorage.getItem("requests") || "[]")

    // Filter requests for current user
    const userRequests = allRequests.filter((req) => req.email === userEmail)
    setRequests(userRequests)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
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
          <UserNav />
        </div>
      </header>
      <main className="flex-1 container px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-blue-900">Panel de Usuario</h1>
            <Link href="/dashboard/new-request">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Nueva Solicitud</Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
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

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-white/70 border border-blue-200">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                Todas
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
              >
                Sin Revisar
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
              >
                En Proceso
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
              >
                Finalizadas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <RequestTable requests={requests} />
            </TabsContent>
            <TabsContent value="pending">
              <RequestTable requests={requests.filter((r) => r.status === "Pendiente")} />
            </TabsContent>
            <TabsContent value="in-progress">
              <RequestTable requests={requests.filter((r) => r.status === "En Revisión")} />
            </TabsContent>
            <TabsContent value="completed">
              <RequestTable requests={requests.filter((r) => r.status === "Finalizado")} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
