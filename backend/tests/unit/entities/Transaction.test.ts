import { Decimal } from 'decimal.js'
import { Transaction, TransactionType, TransactionStatus } from '../../../src/core/entities/Transaction'

describe('Transaction Entity', () => {
  const mockTransactionData = {
    userId: 'user-123',
    description: 'Test Transaction',
    amount: new Decimal('100.50'),
    type: TransactionType.EXPENSE,
    categoryId: 'category-123',
    accountId: 'account-123'
  }

  describe('Constructor', () => {
    it('should create a transaction with default values', () => {
      const transaction = new Transaction(mockTransactionData)

      expect(transaction.userId).toBe('user-123')
      expect(transaction.description).toBe('Test Transaction')
      expect(transaction.amount).toEqual(new Decimal('100.50'))
      expect(transaction.type).toBe(TransactionType.EXPENSE)
      expect(transaction.status).toBe(TransactionStatus.PENDING)
      expect(transaction.id).toBeDefined()
      expect(transaction.createdAt).toBeInstanceOf(Date)
      expect(transaction.date).toBeInstanceOf(Date)
    })

    it('should accept different amount formats', () => {
      const cases = [
        { input: 100, expected: '100.00' },
        { input: '250.75', expected: '250.75' },
        { input: new Decimal('99.99'), expected: '99.99' }
      ]

      cases.forEach(({ input, expected }) => {
        const transaction = new Transaction({
          ...mockTransactionData,
          amount: input
        })

        expect(transaction.getAmountAsString()).toBe(expected)
      })
    })

    it('should create transfer transaction with destination account', () => {
      const transferData = {
        ...mockTransactionData,
        type: TransactionType.TRANSFER,
        toAccountId: 'destination-account-123'
      }

      const transaction = new Transaction(transferData)

      expect(transaction.type).toBe(TransactionType.TRANSFER)
      expect(transaction.toAccountId).toBe('destination-account-123')
      expect(transaction.isTransfer()).toBe(true)
    })
  })

  describe('Validation', () => {
    it('should throw error for zero amount', () => {
      expect(() => new Transaction({
        ...mockTransactionData,
        amount: 0
      })).toThrow('Transaction amount must be greater than zero')
    })

    it('should throw error for negative amount', () => {
      expect(() => new Transaction({
        ...mockTransactionData,
        amount: -50
      })).toThrow('Transaction amount must be greater than zero')
    })

    it('should throw error for transfer without destination account', () => {
      expect(() => new Transaction({
        ...mockTransactionData,
        type: TransactionType.TRANSFER
      })).toThrow('Transfer transactions require a destination account')
    })

    it('should throw error for transfer with same source and destination', () => {
      expect(() => new Transaction({
        ...mockTransactionData,
        type: TransactionType.TRANSFER,
        accountId: 'same-account',
        toAccountId: 'same-account'
      })).toThrow('Source and destination accounts cannot be the same')
    })

    it('should throw error for future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      expect(() => new Transaction({
        ...mockTransactionData,
        date: futureDate
      })).toThrow('Transaction date cannot be in the future')
    })
  })

  describe('Status Management', () => {
    let transaction: Transaction

    beforeEach(() => {
      transaction = new Transaction(mockTransactionData)
    })

    it('should mark transaction as completed', () => {
      transaction.markAsCompleted()

      expect(transaction.status).toBe(TransactionStatus.COMPLETED)
      expect(transaction.updatedAt).toBeInstanceOf(Date)
    })

    it('should mark transaction as cancelled', () => {
      transaction.markAsCancelled()

      expect(transaction.status).toBe(TransactionStatus.CANCELLED)
    })

    it('should mark transaction as failed', () => {
      transaction.markAsFailed()

      expect(transaction.status).toBe(TransactionStatus.FAILED)
    })

    it('should throw error when completing non-pending transaction', () => {
      transaction.markAsCompleted()

      expect(() => transaction.markAsCompleted()).toThrow('Only pending transactions can be completed')
    })

    it('should throw error when cancelling completed transaction', () => {
      transaction.markAsCompleted()

      expect(() => transaction.markAsCancelled()).toThrow('Completed transactions cannot be cancelled')
    })

    it('should throw error when marking completed transaction as failed', () => {
      transaction.markAsCompleted()

      expect(() => transaction.markAsFailed()).toThrow('Completed transactions cannot be marked as failed')
    })

    it('should allow cancelling pending transaction', () => {
      expect(transaction.status).toBe(TransactionStatus.PENDING)

      transaction.markAsCancelled()

      expect(transaction.status).toBe(TransactionStatus.CANCELLED)
    })

    it('should allow marking pending transaction as failed', () => {
      expect(transaction.status).toBe(TransactionStatus.PENDING)

      transaction.markAsFailed()

      expect(transaction.status).toBe(TransactionStatus.FAILED)
    })
  })

  describe('Type Checks', () => {
    it('should identify income transaction', () => {
      const income = new Transaction({
        ...mockTransactionData,
        type: TransactionType.INCOME
      })

      expect(income.isIncome()).toBe(true)
      expect(income.isExpense()).toBe(false)
      expect(income.isTransfer()).toBe(false)
    })

    it('should identify expense transaction', () => {
      const expense = new Transaction({
        ...mockTransactionData,
        type: TransactionType.EXPENSE
      })

      expect(expense.isExpense()).toBe(true)
      expect(expense.isIncome()).toBe(false)
      expect(expense.isTransfer()).toBe(false)
    })

    it('should identify transfer transaction', () => {
      const transfer = new Transaction({
        ...mockTransactionData,
        type: TransactionType.TRANSFER,
        toAccountId: 'destination-123'
      })

      expect(transfer.isTransfer()).toBe(true)
      expect(transfer.isIncome()).toBe(false)
      expect(transfer.isExpense()).toBe(false)
    })
  })

  describe('Amount Formatting', () => {
    let transaction: Transaction

    beforeEach(() => {
      transaction = new Transaction({
        ...mockTransactionData,
        amount: '1234.567'
      })
    })

    it('should return amount as number', () => {
      expect(transaction.getAmountAsNumber()).toBe(1234.567)
    })

    it('should return amount as formatted string', () => {
      expect(transaction.getAmountAsString()).toBe('1234.57')
    })

    it('should handle large amounts', () => {
      const largeTransaction = new Transaction({
        ...mockTransactionData,
        amount: '999999.99'
      })

      expect(largeTransaction.getAmountAsNumber()).toBe(999999.99)
      expect(largeTransaction.getAmountAsString()).toBe('999999.99')
    })

    it('should handle small amounts', () => {
      const smallTransaction = new Transaction({
        ...mockTransactionData,
        amount: '0.01'
      })

      expect(smallTransaction.getAmountAsNumber()).toBe(0.01)
      expect(smallTransaction.getAmountAsString()).toBe('0.01')
    })
  })

  describe('Metadata and Reference', () => {
    it('should store metadata', () => {
      const metadata = { source: 'mobile_app', location: 'Store XYZ' }
      const transaction = new Transaction({
        ...mockTransactionData,
        metadata
      })

      expect(transaction.metadata).toEqual(metadata)
    })

    it('should store reference', () => {
      const reference = 'REF-123456789'
      const transaction = new Transaction({
        ...mockTransactionData,
        reference
      })

      expect(transaction.reference).toBe(reference)
    })
  })

  describe('Audit and JSON Serialization', () => {
    let transaction: Transaction

    beforeEach(() => {
      transaction = new Transaction({
        ...mockTransactionData,
        reference: 'TEST-REF-123',
        metadata: { test: 'data' }
      })
    })

    it('should generate audit log', () => {
      const auditLog = transaction.toAuditLog()

      expect(auditLog).toEqual({
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.getAmountAsString(),
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        date: transaction.date.toISOString(),
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString()
      })
    })

    it('should serialize to JSON', () => {
      const json = transaction.toJSON()

      expect(json).toEqual({
        id: transaction.id,
        userId: transaction.userId,
        description: transaction.description,
        amount: transaction.getAmountAsString(),
        type: transaction.type,
        categoryId: transaction.categoryId,
        accountId: transaction.accountId,
        toAccountId: transaction.toAccountId,
        status: transaction.status,
        date: transaction.date.toISOString(),
        reference: transaction.reference,
        metadata: transaction.metadata,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString()
      })
    })

    it('should handle undefined optional fields in JSON', () => {
      const simpleTransaction = new Transaction({
        userId: 'user-123',
        description: 'Simple Transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123'
      })

      const json = simpleTransaction.toJSON()

      expect(json.toAccountId).toBeUndefined()
      expect(json.reference).toBeUndefined()
      expect(json.metadata).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle decimal precision correctly', () => {
      const transaction = new Transaction({
        ...mockTransactionData,
        amount: '10.999'
      })

      // Should maintain precision in Decimal but format to 2 decimal places for display
      expect(transaction.amount.toString()).toBe('10.999')
      expect(transaction.getAmountAsString()).toBe('11.00') // Rounded for display
    })

    it('should handle very large numbers', () => {
      const transaction = new Transaction({
        ...mockTransactionData,
        amount: '999999999999.99'
      })

      expect(transaction.getAmountAsString()).toBe('999999999999.99')
    })

    it('should create transaction with custom ID', () => {
      const customId = 'custom-transaction-id'
      const transaction = new Transaction({
        ...mockTransactionData,
        id: customId
      })

      expect(transaction.id).toBe(customId)
    })

    it('should create transaction with custom dates', () => {
      const customDate = new Date('2023-01-01')
      const customCreatedAt = new Date('2023-01-01T10:00:00Z')

      const transaction = new Transaction({
        ...mockTransactionData,
        date: customDate,
        createdAt: customCreatedAt
      })

      expect(transaction.date).toEqual(customDate)
      expect(transaction.createdAt).toEqual(customCreatedAt)
    })
  })
})