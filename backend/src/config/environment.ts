import dotenv from 'dotenv'

dotenv.config()

export const config = {
  // Servidor
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Bcrypt
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

  // Email Service
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',

  // SMS Service (Twilio)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Logs
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined',

  // Validação das variáveis obrigatórias
  validate() {
    const requiredVars = [
      'JWT_SECRET',
      'DATABASE_URL'
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`)
    }

    // Validações específicas
    if (this.bcryptSaltRounds < 10) {
      console.warn('⚠️  BCRYPT_SALT_ROUNDS muito baixo. Recomendado: 12 ou mais')
    }

    if (this.nodeEnv === 'production' && this.jwtSecret === 'fallback-secret-key') {
      throw new Error('JWT_SECRET deve ser definido em produção')
    }

    console.log('✅ Configurações validadas com sucesso')
  }
}

// Validar configurações na importação
if (process.env.NODE_ENV !== 'test') {
  config.validate()
}