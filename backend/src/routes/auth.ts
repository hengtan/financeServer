import { Router } from 'express'

const router = Router()

// Rota temporária para teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de autenticação funcionando!',
    timestamp: new Date().toISOString()
  })
})

export { router as authRoutes }