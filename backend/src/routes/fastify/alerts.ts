import { FastifyInstance } from 'fastify'
import { Container } from 'typedi'
import { AlertService } from '../../services/AlertService'
import { FastifyJWTCustomPayload } from '../../infrastructure/auth/JWTPlugin'
import { AlertType, AlertSeverity, AlertStatus, AlertChannel } from '../../core/entities/Alert'

export default async function alertRoutes(fastify: FastifyInstance) {
  const alertService = Container.get(AlertService)

  // Get alerts with filters
  fastify.get('/alerts', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.values(AlertType) },
          severity: { type: 'string', enum: Object.values(AlertSeverity) },
          status: { type: 'string', enum: Object.values(AlertStatus) },
          dateFrom: { type: 'string', format: 'date' },
          dateTo: { type: 'string', format: 'date' },
          includeExpired: { type: 'boolean' },
          limit: { type: 'number', minimum: 1, maximum: 100 },
          offset: { type: 'number', minimum: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const filters = request.query as any

      const result = await alertService.getAlertsByUser(userId, {
        type: filters.type,
        severity: filters.severity,
        status: filters.status,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        includeExpired: filters.includeExpired
      })

      return reply.code(200).send({
        success: true,
        data: result
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get alert by ID
  fastify.get('/alerts/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { id } = request.params as { id: string }

      const alert = await alertService.getAlertById(id, userId)

      if (!alert) {
        return reply.code(404).send({
          success: false,
          error: 'Alert not found'
        })
      }

      return reply.code(200).send({
        success: true,
        data: alert
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get unread alerts
  fastify.get('/alerts/unread', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      const alerts = await alertService.getUnreadAlerts(userId)

      return reply.code(200).send({
        success: true,
        data: alerts
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get unread alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get critical alerts
  fastify.get('/alerts/critical', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      const alerts = await alertService.getCriticalAlerts(userId)

      return reply.code(200).send({
        success: true,
        data: alerts
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get critical alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get alert statistics
  fastify.get('/alerts/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      const stats = await alertService.getAlertStats(userId)

      return reply.code(200).send({
        success: true,
        data: stats
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get alert statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get unread count
  fastify.get('/alerts/unread/count', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      const count = await alertService.getUnreadCount(userId)

      return reply.code(200).send({
        success: true,
        data: { count }
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get unread count',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Create alert
  fastify.post('/alerts', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.values(AlertType) },
          severity: { type: 'string', enum: Object.values(AlertSeverity) },
          title: { type: 'string', minLength: 1, maxLength: 200 },
          message: { type: 'string', minLength: 1, maxLength: 1000 },
          description: { type: 'string', maxLength: 2000 },
          data: { type: 'object' },
          actionUrl: { type: 'string' },
          actionText: { type: 'string' },
          expiresInHours: { type: 'number', minimum: 1, maximum: 8760 },
          channels: {
            type: 'array',
            items: { type: 'string', enum: Object.values(AlertChannel) }
          }
        },
        required: ['type', 'severity', 'title', 'message', 'data']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const alertData = request.body as any

      const alert = await alertService.createAlert({
        userId,
        ...alertData
      })

      return reply.code(201).send({
        success: true,
        data: alert
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to create alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Mark alert as read
  fastify.patch('/alerts/:id/read', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { id } = request.params as { id: string }

      const alert = await alertService.markAsRead(id, userId)

      return reply.code(200).send({
        success: true,
        data: alert
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark alert as read',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Mark alert as dismissed
  fastify.patch('/alerts/:id/dismiss', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { id } = request.params as { id: string }

      const alert = await alertService.markAsDismissed(id, userId)

      return reply.code(200).send({
        success: true,
        data: alert
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark alert as dismissed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Mark all alerts as read
  fastify.patch('/alerts/read-all', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      const count = await alertService.markAllAsRead(userId)

      return reply.code(200).send({
        success: true,
        data: { count }
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark all alerts as read',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Mark all alerts as dismissed
  fastify.patch('/alerts/dismiss-all', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      const count = await alertService.markAllAsDismissed(userId)

      return reply.code(200).send({
        success: true,
        data: { count }
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark all alerts as dismissed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Delete alert
  fastify.delete('/alerts/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { id } = request.params as { id: string }

      await alertService.deleteAlert(id, userId)

      return reply.code(200).send({
        success: true,
        message: 'Alert deleted successfully'
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Generate smart alerts
  fastify.post('/alerts/smart-generate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          budgetExceededThreshold: { type: 'number', minimum: 0, maximum: 100 },
          highSpendingThreshold: { type: 'number', minimum: 0 },
          lowBalanceThreshold: { type: 'number', minimum: 0 },
          unusualTransactionMultiplier: { type: 'number', minimum: 1 },
          enableBudgetAlerts: { type: 'boolean' },
          enableSpendingAlerts: { type: 'boolean' },
          enableBalanceAlerts: { type: 'boolean' },
          enableAnomalyDetection: { type: 'boolean' },
          cooldownHours: { type: 'number', minimum: 1, maximum: 168 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const config = request.body as any

      const alerts = await alertService.generateSmartAlerts(userId, config)

      return reply.code(200).send({
        success: true,
        data: alerts
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to generate smart alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get credit card alerts
  fastify.get('/alerts/credit-cards', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      // Get alerts filtered by CREDIT_CARD_DUE type
      const result = await alertService.getAlertsByUser(userId, {
        type: AlertType.CREDIT_CARD_DUE,
        status: AlertStatus.ACTIVE
      })

      return reply.code(200).send({
        success: true,
        data: result.alerts,
        count: result.total
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get credit card alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Search alerts
  fastify.get('/alerts/search', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1 }
        },
        required: ['q']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { q } = request.query as { q: string }

      const alerts = await alertService.searchAlerts(q, userId)

      return reply.code(200).send({
        success: true,
        data: alerts
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to search alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Bulk operations
  fastify.patch('/alerts/bulk/read', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 100
          }
        },
        required: ['ids']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { ids } = request.body as { ids: string[] }

      // Verify ownership and mark as read
      const promises = ids.map(id => alertService.markAsRead(id, userId))
      await Promise.all(promises)

      return reply.code(200).send({
        success: true,
        message: `${ids.length} alerts marked as read`
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark alerts as read',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  fastify.patch('/alerts/bulk/dismiss', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 100
          }
        },
        required: ['ids']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { ids } = request.body as { ids: string[] }

      // Verify ownership and mark as dismissed
      const promises = ids.map(id => alertService.markAsDismissed(id, userId))
      await Promise.all(promises)

      return reply.code(200).send({
        success: true,
        message: `${ids.length} alerts marked as dismissed`
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark alerts as dismissed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  fastify.delete('/alerts/bulk', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 100
          }
        },
        required: ['ids']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { ids } = request.body as { ids: string[] }

      // Verify ownership and delete
      const promises = ids.map(id => alertService.deleteAlert(id, userId))
      await Promise.all(promises)

      return reply.code(200).send({
        success: true,
        message: `${ids.length} alerts deleted`
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}