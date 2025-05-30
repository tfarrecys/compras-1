export const config = {
  database: {
    url: process.env.DATABASE_URL,
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    connectionTimeout: 10000, // 10 segundos
  },
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const 