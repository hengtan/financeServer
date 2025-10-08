/**
 * Reports Routes - Stub implementation returning empty data
 * Full implementation will be done in Python analytics service
 */

import { Router } from 'express'

const router = Router()

// GET /api/reports/monthly-trend
router.get('/monthly-trend', async (req, res) => {
  res.json({
    success: true,
    data: []
  })
})

// GET /api/reports/expenses-by-category
router.get('/expenses-by-category', async (req, res) => {
  res.json({
    success: true,
    data: []
  })
})

// GET /api/reports/income-by-source
router.get('/income-by-source', async (req, res) => {
  res.json({
    success: true,
    data: []
  })
})

export { router as reportsRoutes }
