export const config = {
  database: {
    url: process.env.DATABASE_URL,
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    connectionTimeout: 10000, // 10 segundos
    poolSize: 1, // En serverless es mejor mantener 1
    idleTimeout: 10000, // 10 segundos
    statementTimeout: 30000, // 30 segundos
    queryTimeout: 30000, // 30 segundos
  },
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  debug: process.env.DEBUG === 'true',
} as const 