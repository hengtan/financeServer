import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Importar configurações e middlewares
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import { config } from './config/environment'

// Importar rotas
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { transactionRoutes } from './routes/transactions'
import { categoryRoutes } from './routes/categories'
import { goalRoutes } from './routes/goals'
import { reportsRoutes } from './routes/reports'
import { analyticsProxyRoutes } from './routes/analytics-proxy'

// Carregar variáveis de ambiente
dotenv.config()

// Criar instância do Express
const app = express()

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Muitas solicitações realizadas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Middlewares de segurança e configuração
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para desenvolvimento
  crossOriginEmbedderPolicy: false
}))
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))
app.use(compression())
app.use(morgan(config.logFormat))
app.use(limiter)

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Rotas da API
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/analytics', analyticsProxyRoutes)

// Middleware para rotas não encontradas
app.use(notFoundHandler)

// Middleware de tratamento de erros
app.use(errorHandler)

// Iniciar servidor
const server = app.listen(config.port, () => {
  console.log(`🚀 Servidor rodando na porta ${config.port}`)
  console.log(`📊 Ambiente: ${config.nodeEnv}`)
  console.log(`🔗 URL: http://localhost:${config.port}`)
  console.log(`🏥 Health check: http://localhost:${config.port}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📦 SIGTERM recebido, fechando servidor...')
  server.close(() => {
    console.log('✅ Servidor fechado com sucesso')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('📦 SIGINT recebido, fechando servidor...')
  server.close(() => {
    console.log('✅ Servidor fechado com sucesso')
    process.exit(0)
  })
})

export { app }