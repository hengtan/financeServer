import { Router } from 'express'

const router = Router()

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de usuários funcionando!',
    timestamp: new Date().toISOString()
  })
})

export { router as userRoutes }