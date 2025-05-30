"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, User } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Request {
  id: string
  description: string
  date: string
  status: string
  user: string
  sector: string
  email?: string
  priority?: string
  resolvedBy?: string
  resolvedByEmail?: string
  resolvedAt?: string
}

interface AdminRequestTableProps {
  requests: Request[]
  updateStatus: (id: string, status: string) => void
}

export function AdminRequestTable({ requests, updateStatus }: AdminRequestTableProps) {
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
        return <Badge className="bg-blue-600 text-white">Finalizado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Crítica":
        return (
          <Badge variant="destructive" className="text-xs">
            Crítica
          </Badge>
        )
      case "Alta":
        return <Badge className="bg-orange-500 text-white text-xs">Alta</Badge>
      case "Media":
        return (
          <Badge variant="secondary" className="text-xs">
            Media
          </Badge>
        )
      case "Baja":
        return (
          <Badge variant="outline" className="text-xs">
            Baja
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {priority}
          </Badge>
        )
    }
  }

  return (
    <div className="rounded-md border border-blue-200 bg-white/70 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-blue-200">
            <TableHead className="text-blue-900">ID</TableHead>
            <TableHead className="text-blue-900">Descripción</TableHead>
            <TableHead className="text-blue-900">Solicitante</TableHead>
            <TableHead className="text-blue-900">Sector</TableHead>
            <TableHead className="text-blue-900">Prioridad</TableHead>
            <TableHead className="text-blue-900">Fecha</TableHead>
            <TableHead className="text-blue-900">Estado</TableHead>
            <TableHead className="text-blue-900">Resuelto por</TableHead>
            <TableHead className="text-right text-blue-900">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-blue-600">
                No hay solicitudes para mostrar
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id} className="border-blue-100 hover:bg-blue-50/50">
                <TableCell className="font-medium text-blue-900">{request.id}</TableCell>
                <TableCell className="text-gray-700">{request.description}</TableCell>
                <TableCell className="text-gray-700">{request.email || request.user}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                    {request.sector}
                  </Badge>
                </TableCell>
                <TableCell>{request.priority && getPriorityBadge(request.priority)}</TableCell>
                <TableCell className="text-gray-600">{request.date}</TableCell>
                <TableCell>
                  <Select defaultValue={request.status} onValueChange={(newStatus) => updateStatus(request.id, newStatus)}>
                    <SelectTrigger className="w-36 bg-white border-blue-200">
                      <SelectValue placeholder={request.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Revisión">En Revisión</SelectItem>
                      <SelectItem value="Aprobado">Aprobado</SelectItem>
                      <SelectItem value="Rechazado">Rechazado</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {request.resolvedBy ? (
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-700 font-medium">{request.resolvedBy}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/dashboard/${request.id}`}>
                    <Button variant="ghost" size="icon" className="hover:bg-blue-100">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="sr-only">Ver detalles</span>
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
