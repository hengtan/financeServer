import { setupServer } from 'msw/node'
import { authHandlers } from './handlers/auth'
import { transactionHandlers } from './handlers/transactions'

// Setup MSW server with all handlers
export const server = setupServer(
  ...authHandlers,
  ...transactionHandlers
)