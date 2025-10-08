import { FastifyInstance } from 'fastify'

export default async function reportRoutes(fastify: FastifyInstance) {
  const prefix = '/api/reports'

  // GET /api/reports/monthly-trend
  fastify.get(`${prefix}/monthly-trend`, async (request, reply) => {
    return reply.send({
      success: true,
      data: []
    })
  })

  // GET /api/reports/expenses-by-category
  fastify.get(`${prefix}/expenses-by-category`, async (request, reply) => {
    return reply.send({
      success: true,
      data: []
    })
  })

  // GET /api/reports/income-by-source
  fastify.get(`${prefix}/income-by-source`, async (request, reply) => {
    return reply.send({
      success: true,
      data: []
    })
  })
}
