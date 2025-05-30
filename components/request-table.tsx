"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Request {
  id: string
  description: string
  date: string
  status: string
}

interface RequestTableProps {
  requests: Request[]
}

export function RequestTable({ requests }: RequestTableProps) {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No hay solicitudes para mostrar
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.description}</TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/request/${request.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
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
