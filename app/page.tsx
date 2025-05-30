import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
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
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium hover:underline text-blue-700 hover:text-blue-900">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-medium hover:underline text-blue-700 hover:text-blue-900">
              Registrarse
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-900">
                  Sistema de Gestión de Solicitudes de Compra
                </h1>
                <p className="mx-auto max-w-[700px] text-blue-700 md:text-xl">
                  Gestione sus solicitudes de compra de manera eficiente. Realice seguimiento en tiempo real y reciba
                  notificaciones sobre el estado de sus pedidos.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Iniciar Sesión</Button>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  Crear Cuenta
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white/70 backdrop-blur-sm">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Solicitudes de Compra</CardTitle>
                  <CardDescription className="text-blue-700">Cree y gestione sus solicitudes de compra</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600">
                    Envíe solicitudes detalladas especificando su sector, descripción del producto y otros detalles
                    relevantes para el departamento de compras.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Seguimiento en Tiempo Real</CardTitle>
                  <CardDescription className="text-blue-700">Monitoree el estado de sus solicitudes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600">
                    Visualice el estado actual de todas sus solicitudes: sin revisar, en proceso o finalizado, y reciba
                    notificaciones por correo electrónico cuando cambie su estado.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Gestión Centralizada</CardTitle>
                  <CardDescription className="text-blue-700">Para encargados de compras</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600">
                    Acceda a un panel de control centralizado para revisar todas las solicitudes entrantes, actualizar
                    estados y gestionar el proceso de compra de manera eficiente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white/80 backdrop-blur-sm border-blue-200">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <p className="text-sm text-blue-600">© 2024 Sistema de Compras. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}