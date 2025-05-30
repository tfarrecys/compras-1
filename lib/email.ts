import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Actualizar la configuración de email para usar tu email específico
const EMAIL_CONFIG = {
  from: "Sistema de Compras <onboarding@resend.dev>", // Dominio gratuito de Resend
  isProduction: process.env.NODE_ENV === "production",
  testEmail: "tfarrerascys@gmail.com", // Tu email específico
}

// Función principal para enviar emails
async function sendEmail(to: string, subject: string, htmlContent: string, emailType: string) {
  // Si no hay API key configurada, solo loguear y continuar
  if (!resend) {
    console.log('RESEND_API_KEY no configurada - Email simulado:', {
      to,
      subject,
      emailType
    })
    return { success: true, simulated: true }
  }

  try {
    // En desarrollo: todos los emails van a tu dirección
    // En producción: van a las direcciones reales
    const recipient = EMAIL_CONFIG.isProduction ? to : EMAIL_CONFIG.testEmail

    // En desarrollo, agregar información del destinatario original
    const finalSubject = EMAIL_CONFIG.isProduction ? subject : `[${emailType}] ${subject}`

    const finalHtml = EMAIL_CONFIG.isProduction
      ? htmlContent
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 8px; border-left: 5px solid #2196f3;">
            <h3 style="margin: 0; color: #1976d2;">📧 MODO DESARROLLO - Sistema de Compras</h3>
            <p style="margin: 8px 0 0 0;"><strong>Destinatario original:</strong> ${to}</p>
            <p style="margin: 5px 0 0 0;"><strong>Tipo de notificación:</strong> ${emailType}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
              En producción, este correo se enviaría directamente a ${to}
            </p>
          </div>
          ${htmlContent}
        </div>
      `

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [recipient],
      subject: finalSubject,
      html: finalHtml,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    console.log(`Email enviado exitosamente a ${recipient} (original: ${to})`)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendStatusUpdateEmail(
  userEmail: string,
  userName: string,
  requestId: string,
  newStatus: string,
  requestDescription: string,
) {
  const statusMap = {
    Pendiente: "Pendiente",
    "En Revisión": "En Revisión",
    Aprobado: "Aprobado",
    Rechazado: "Rechazado",
    Finalizado: "Finalizado",
  }

  const statusText = statusMap[newStatus as keyof typeof statusMap] || newStatus

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📦 Sistema de Compras</h1>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Actualización de Solicitud de Compra
        </h2>
        
        <p style="font-size: 16px; color: #555;">Estimado/a <strong>${userName}</strong>,</p>
        
        <p style="font-size: 16px; color: #555;">Su solicitud de compra ha sido actualizada:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 5px 0;"><strong>ID de Solicitud:</strong> <span style="color: #2563eb;">${requestId}</span></p>
          <p style="margin: 5px 0;"><strong>Descripción:</strong> ${requestDescription}</p>
          <p style="margin: 5px 0;"><strong>Nuevo Estado:</strong> 
            <span style="background-color: #2563eb; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold;">
              ${statusText}
            </span>
          </p>
        </div>
        
        <p style="font-size: 16px; color: #555;">
          Puede ver los detalles completos y comunicarse con el departamento de compras 
          ingresando a su panel de usuario.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Saludos,<br>
            <strong>Departamento de Compras</strong>
          </p>
        </div>
      </div>
    </div>
  `

  return await sendEmail(userEmail, `Actualización de solicitud #${requestId}`, htmlContent, "ACTUALIZACIÓN DE ESTADO")
}

export async function sendNewRequestEmail(
  requestId: string,
  userEmail: string,
  userName: string,
  description: string,
  sector: string,
  category: string,
  priority: string,
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📦 Sistema de Compras</h1>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
          🆕 Nueva Solicitud de Compra Recibida
        </h2>
        
        <p style="font-size: 16px; color: #555;">Estimado Departamento de Compras,</p>
        
        <p style="font-size: 16px; color: #555;">Se ha recibido una nueva solicitud de compra que requiere su atención:</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <p style="margin: 5px 0;"><strong>ID de Solicitud:</strong> <span style="color: #16a34a; font-weight: bold;">${requestId}</span></p>
          <p style="margin: 5px 0;"><strong>Solicitante:</strong> ${userName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 5px 0;"><strong>Sector:</strong> ${sector}</p>
          <p style="margin: 5px 0;"><strong>Categoría:</strong> ${category}</p>
          <p style="margin: 5px 0;"><strong>Prioridad:</strong> 
            <span style="background-color: ${priority === "Crítica" ? "#dc2626" : priority === "Alta" ? "#ea580c" : priority === "Media" ? "#2563eb" : "#6b7280"}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
              ${priority}
            </span>
          </p>
          <p style="margin: 15px 0 5px 0;"><strong>Descripción:</strong></p>
          <p style="margin: 5px 0; padding: 10px; background-color: white; border-radius: 4px; font-style: italic;">
            "${description}"
          </p>
        </div>
        
        <p style="font-size: 16px; color: #555;">
          Por favor revise los detalles completos en el panel de administración.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Sistema de Compras</strong><br>
            Notificación automática
          </p>
        </div>
      </div>
    </div>
  `

  // Para nuevas solicitudes, notificar a los administradores
  return await sendEmail(
    "admin@compras.com",
    `Nueva solicitud de compra #${requestId} - ${priority} prioridad`,
    htmlContent,
    "NUEVA SOLICITUD",
  )
}

export async function sendNewMessageEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messageContent: string,
  requestId: string,
  isToAdmin = false,
) {
  const subject = isToAdmin
    ? `💬 Nuevo mensaje en solicitud #${requestId}`
    : `💬 Respuesta del departamento de compras - Solicitud #${requestId}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📦 Sistema de Compras</h1>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">
          ${isToAdmin ? "💬 Nuevo Mensaje Recibido" : "💬 Respuesta del Departamento de Compras"}
        </h2>
        
        <p style="font-size: 16px; color: #555;">Estimado/a <strong>${recipientName}</strong>,</p>
        
        <p style="font-size: 16px; color: #555;">
          ${isToAdmin ? "Ha recibido un nuevo mensaje" : "El departamento de compras ha respondido"} 
          en la solicitud <strong>#${requestId}</strong>:
        </p>
        
        <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
          <p style="margin: 5px 0;"><strong>De:</strong> ${senderName}</p>
          <p style="margin: 15px 0 5px 0;"><strong>Mensaje:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 10px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">
              ${messageContent}
            </p>
          </div>
        </div>
        
        <p style="font-size: 16px; color: #555;">
          Puede responder y ver la conversación completa 
          ${isToAdmin ? "en el panel de administración" : "en su panel de usuario"}.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Saludos,<br>
            <strong>Sistema de Compras</strong>
          </p>
        </div>
      </div>
    </div>
  `

  return await sendEmail(recipientEmail, subject, htmlContent, isToAdmin ? "MENSAJE PARA ADMIN" : "RESPUESTA A USUARIO")
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📦 Sistema de Compras</h1>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
          🎉 ¡Bienvenido al Sistema de Compras!
        </h2>
        
        <p style="font-size: 16px; color: #555;">Estimado/a <strong>${userName}</strong>,</p>
        
        <p style="font-size: 16px; color: #555;">
          ¡Su cuenta ha sido creada exitosamente! Ya puede comenzar a utilizar el sistema de gestión de solicitudes de compra.
        </p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="color: #16a34a; margin-top: 0;">¿Qué puede hacer ahora?</h3>
          <ul style="color: #555; line-height: 1.8;">
            <li>✅ Crear nuevas solicitudes de compra</li>
            <li>📊 Ver el estado de sus solicitudes</li>
            <li>💬 Comunicarse con el departamento de compras</li>
            <li>📧 Recibir notificaciones por email</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; color: #555;">
          Para comenzar, simplemente inicie sesión en su panel de usuario y cree su primera solicitud.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Saludos,<br>
            <strong>Equipo del Sistema de Compras</strong>
          </p>
        </div>
      </div>
    </div>
  `

  return await sendEmail(userEmail, "🎉 ¡Bienvenido al Sistema de Compras!", htmlContent, "BIENVENIDA")
}
