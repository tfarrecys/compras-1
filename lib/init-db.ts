import { sql } from './db'
import { config } from './config'

export async function initializeDatabase() {
  console.log('Iniciando inicialización de la base de datos...')
  console.log('URL de la base de datos:', config.database.url?.substring(0, 20) + '...')
  
  try {
    // Verificar conexión primero
    try {
      await sql`SELECT 1`
      console.log('Conexión a la base de datos verificada')
    } catch (error) {
      console.error('Error al verificar la conexión:', error)
      throw new Error('No se pudo establecer conexión con la base de datos')
    }

    // Eliminar tabla si existe
    try {
      await sql`DROP TABLE IF EXISTS requests`
      console.log('Tabla anterior eliminada si existía')
    } catch (error) {
      console.error('Error al intentar eliminar tabla:', error)
      throw error
    }

    // Crear tabla requests
    try {
      await sql`
        CREATE TABLE requests (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          sector TEXT NOT NULL,
          category TEXT,
          priority TEXT,
          description TEXT NOT NULL,
          quantity TEXT,
          budget TEXT,
          observations TEXT,
          date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pendiente',
          resolved_by TEXT,
          resolved_by_email TEXT,
          resolved_at TEXT,
          username TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('Tabla requests creada correctamente')
    } catch (error) {
      console.error('Error al crear tabla requests:', error)
      throw error
    }

    // Verificar que la tabla existe y tiene la estructura correcta
    try {
      const tableInfo = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'requests'
        ORDER BY ordinal_position
      `
      console.log('Estructura de la tabla requests:', tableInfo)
    } catch (error) {
      console.error('Error al verificar estructura de la tabla:', error)
      throw error
    }

    console.log('Base de datos inicializada correctamente')
    return true
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error)
    return false
  }
} 