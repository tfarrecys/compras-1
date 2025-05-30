// Tipos de errores personalizados
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class EmailError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EmailError"
  }
}

// Función para registrar errores
export function logError(error: Error, context?: any) {
  // En producción, podrías enviar esto a un servicio como Sentry
  console.error(`[${error.name}] ${error.message}`, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}

// Función para manejar errores en API routes
export function handleApiError(error: any, defaultMessage = "Ocurrió un error inesperado") {
  logError(error)

  if (error instanceof AuthError) {
    return { status: 401, message: error.message }
  }

  if (error instanceof DatabaseError) {
    return { status: 500, message: "Error en la base de datos. Intente nuevamente más tarde." }
  }

  if (error instanceof EmailError) {
    return { status: 500, message: "No se pudo enviar el correo electrónico. Intente nuevamente más tarde." }
  }

  return { status: 500, message: defaultMessage }
}
