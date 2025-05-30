"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

export function UserNav() {
  const router = useRouter()

  const handleNavigation = (path: string, actionName: string) => {
    if (path === "/profile" || path === "/settings") {
      toast({
        title: "🚧 Función en desarrollo",
        description: `La sección ${actionName} estará disponible próximamente.`,
        duration: 3000,
      })
    } else {
      router.push(path)
    }
  }

  const handleLogout = () => {
    // Eliminar datos del localStorage
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    
    // Eliminar cookies
    Cookies.remove("user-token")
    Cookies.remove("user-type")
    
    toast({
      title: "👋 Sesión cerrada",
      description: "Ha cerrado sesión exitosamente. Redirigiendo...",
      duration: 3000,
    })
    
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {(localStorage.getItem("userName") || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{localStorage.getItem("userName") || "Usuario"}</p>
            <p className="text-xs leading-none text-muted-foreground">{localStorage.getItem("userEmail")}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation("/dashboard", "Panel de Control")}>
            Panel de Control
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/dashboard/new-request", "Nueva Solicitud")}>
            Nueva Solicitud
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/profile", "Perfil")}>Perfil</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation("/settings", "Configuración")}>
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
