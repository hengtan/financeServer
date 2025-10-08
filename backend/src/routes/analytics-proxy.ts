/**
 * Analytics Proxy - Routes requests to Python FastAPI service
 *
 * Transparently forwards /api/analytics/* requests to Python backend
 * running on port 8000
 */

import { Router, Request, Response, NextFunction } from 'express'
import axios from 'axios'

const router = Router()

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

/**
 * Proxy middleware for all /api/analytics/* routes
 */
router.all('/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = req.originalUrl.replace('/api/analytics', '/analytics')
    const url = `${PYTHON_SERVICE_URL}${path}`

    console.log(`🔄 Proxying to Python service: ${req.method} ${url}`)

    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      params: req.query,
      headers: {
        // Forward important headers
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'User-Agent': 'FinanceServer-NodeProxy/1.0'
      },
      timeout: 30000, // 30 second timeout for analytics
      validateStatus: () => true // Don't throw on any status code
    })

    // Forward the response
    res.status(response.status).json(response.data)

  } catch (error: any) {
    console.error('❌ Analytics proxy error:', error.message)

    // If Python service is down
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        error: 'Analytics service unavailable',
        message: 'O serviço de analytics está temporariamente indisponível.',
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    // Other errors
    return res.status(500).json({
      error: 'Analytics proxy error',
      message: error.message,
      code: 'PROXY_ERROR'
    })
  }
})

export { router as analyticsProxyRoutes }
