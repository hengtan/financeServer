import { ProcessTransactionUseCase } from '../../../src/core/usecases/ProcessTransactionUseCase'
import { TransactionType, TransactionStatus } from '../../../src/core/entities/Transaction'
import { Account, AccountType, AccountStatus } from '../../../src/core/entities/Account'
import { Category, CategoryType, CategoryStatus } from '../../../src/core/entities/Category'
import { ITransactionRepository } from '../../../src/core/interfaces/repositories/ITransactionRepository'
import { IAccountRepository } from '../../../src/core/interfaces/repositories/IAccountRepository'
import { ICategoryRepository } from '../../../src/core/interfaces/repositories/ICategoryRepository'
import { Decimal } from 'decimal.js'

describe('ProcessTransactionUseCase', () => {
  let useCase: ProcessTransactionUseCase
  let mockTransactionRepo: jest.Mocked<ITransactionRepository>
  let mockAccountRepo: jest.Mocked<IAccountRepository>
  let mockCategoryRepo: jest.Mocked<ICategoryRepository>

  const mockUser = { id: 'user-123', name: 'Test User' }
  const mockCategory = new Category({
    id: 'category-123',
    userId: 'user-123',
    name: 'Food',
    type: CategoryType.EXPENSE
  })
  const mockAccount = new Account({
    id: 'account-123',
    userId: 'user-123',
    name: 'Checking Account',
    type: AccountType.CHECKING,
    balance: 1000
  })

  beforeEach(() => {
    // Create mock repositories
    mockTransactionRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByAccountId: jest.fn(),
      getBalanceByAccount: jest.fn(),
      getMonthlySpending: jest.fn(),
      getYearlySpending: jest.fn()
    }

    mockAccountRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findDefaultByUserId: jest.fn(),
      existsByUserIdAndName: jest.fn()
    }

    mockCategoryRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByUserIdAndName: jest.fn(),
      findDefaultCategories: jest.fn()
    }

    useCase = new ProcessTransactionUseCase(
      mockTransactionRepo,
      mockAccountRepo,
      mockCategoryRepo
    )
  })

  describe('Expense Transaction', () => {
    it('should process expense transaction successfully', async () => {
      const request = {
        userId: 'user-123',
        description: 'Lunch at restaurant',
        amount: 25.50,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123'
      }

      // Setup mocks
      mockCategoryRepo.findById.mockResolvedValue(mockCategory)
      mockAccountRepo.findById.mockResolvedValue(mockAccount)
      mockAccountRepo.update.mockResolvedValue(mockAccount)
      mockTransactionRepo.create.mockResolvedValue(expect.any(Object))

      const result = await useCase.execute(request)

      expect(result.transaction.status).toBe(TransactionStatus.COMPLETED)
      expect(result.sourceAccount.balance).toEqual(new Decimal(974.50))
      expect(mockAccountRepo.update).toHaveBeenCalledWith(mockAccount)
      expect(mockTransactionRepo.create).toHaveBeenCalled()
    })

    it('should fail if account has insufficient funds', async () => {
      const request = {
        userId: 'user-123',
        description: 'Expensive purchase',
        amount: 2000,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(mockCategory)
      mockAccountRepo.findById.mockResolvedValue(mockAccount)

      await expect(useCase.execute(request)).rejects.toThrow('Insufficient funds')
    })
  })

  describe('Income Transaction', () => {
    it('should process income transaction successfully', async () => {
      const incomeCategory = new Category({
        id: 'income-category-123',
        userId: 'user-123',
        name: 'Salary',
        type: CategoryType.INCOME
      })

      const request = {
        userId: 'user-123',
        description: 'Monthly salary',
        amount: 5000,
        type: TransactionType.INCOME,
        categoryId: 'income-category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(incomeCategory)
      mockAccountRepo.findById.mockResolvedValue(mockAccount)
      mockAccountRepo.update.mockResolvedValue(mockAccount)
      mockTransactionRepo.create.mockResolvedValue(expect.any(Object))

      const result = await useCase.execute(request)

      expect(result.transaction.status).toBe(TransactionStatus.COMPLETED)
      expect(result.sourceAccount.balance).toEqual(new Decimal(6000))
      expect(mockAccountRepo.update).toHaveBeenCalledWith(mockAccount)
    })
  })

  describe('Transfer Transaction', () => {
    it('should process transfer transaction successfully', async () => {
      const transferCategory = new Category({
        id: 'transfer-category-123',
        userId: 'user-123',
        name: 'Transfer',
        type: CategoryType.TRANSFER
      })

      const destinationAccount = new Account({
        id: 'destination-account-123',
        userId: 'user-123',
        name: 'Savings Account',
        type: AccountType.SAVINGS,
        balance: 500
      })

      const request = {
        userId: 'user-123',
        description: 'Transfer to savings',
        amount: 200,
        type: TransactionType.TRANSFER,
        categoryId: 'transfer-category-123',
        accountId: 'account-123',
        toAccountId: 'destination-account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(transferCategory)
      mockAccountRepo.findById
        .mockResolvedValueOnce(mockAccount)
        .mockResolvedValueOnce(destinationAccount)
      mockAccountRepo.update.mockResolvedValue(expect.any(Object))
      mockTransactionRepo.create.mockResolvedValue(expect.any(Object))

      const result = await useCase.execute(request)

      expect(result.transaction.status).toBe(TransactionStatus.COMPLETED)
      expect(result.sourceAccount.balance).toEqual(new Decimal(800))
      expect(result.destinationAccount?.balance).toEqual(new Decimal(700))
      expect(mockAccountRepo.update).toHaveBeenCalledTimes(2)
    })

    it('should fail transfer without destination account ID', async () => {
      const transferCategory = new Category({
        id: 'transfer-category-123',
        userId: 'user-123',
        name: 'Transfer',
        type: CategoryType.TRANSFER
      })

      const request = {
        userId: 'user-123',
        description: 'Invalid transfer',
        amount: 200,
        type: TransactionType.TRANSFER,
        categoryId: 'transfer-category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(transferCategory)

      await expect(useCase.execute(request)).rejects.toThrow('Destination account is required for transfer transactions')
    })

    it('should fail transfer to same account', async () => {
      const transferCategory = new Category({
        id: 'transfer-category-123',
        userId: 'user-123',
        name: 'Transfer',
        type: CategoryType.TRANSFER
      })

      const request = {
        userId: 'user-123',
        description: 'Same account transfer',
        amount: 200,
        type: TransactionType.TRANSFER,
        categoryId: 'transfer-category-123',
        accountId: 'account-123',
        toAccountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(transferCategory)

      await expect(useCase.execute(request)).rejects.toThrow('Source and destination accounts cannot be the same')
    })
  })

  describe('Validation', () => {
    it('should fail if category not found', async () => {
      const request = {
        userId: 'user-123',
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'non-existent-category',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(null)

      await expect(useCase.execute(request)).rejects.toThrow('Category not found')
    })

    it('should fail if account not found', async () => {
      const request = {
        userId: 'user-123',
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'non-existent-account'
      }

      mockCategoryRepo.findById.mockResolvedValue(mockCategory)
      mockAccountRepo.findById.mockResolvedValue(null)

      await expect(useCase.execute(request)).rejects.toThrow('Source account not found')
    })

    it('should fail if category belongs to different user', async () => {
      const otherUserCategory = new Category({
        id: 'other-category-123',
        userId: 'other-user-123',
        name: 'Other Category',
        type: CategoryType.EXPENSE
      })

      const request = {
        userId: 'user-123',
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'other-category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(otherUserCategory)

      await expect(useCase.execute(request)).rejects.toThrow('Category does not belong to the user')
    })

    it('should fail if account belongs to different user', async () => {
      const otherUserAccount = new Account({
        id: 'other-account-123',
        userId: 'other-user-123',
        name: 'Other Account',
        type: AccountType.CHECKING,
        balance: 1000
      })

      const request = {
        userId: 'user-123',
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'other-account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(mockCategory)
      mockAccountRepo.findById.mockResolvedValue(otherUserAccount)

      await expect(useCase.execute(request)).rejects.toThrow('Account does not belong to the user')
    })

    it('should fail if account is inactive', async () => {
      const inactiveAccount = new Account({
        ...mockAccount,
        status: AccountStatus.INACTIVE
      })

      const request = {
        userId: 'user-123',
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(mockCategory)
      mockAccountRepo.findById.mockResolvedValue(inactiveAccount)

      await expect(useCase.execute(request)).rejects.toThrow('Source account is not active')
    })

    it('should fail if category is inactive', async () => {
      const inactiveCategory = new Category({
        ...mockCategory,
        status: CategoryStatus.INACTIVE
      })

      const request = {
        userId: 'user-123',
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(inactiveCategory)

      await expect(useCase.execute(request)).rejects.toThrow('Category is not active')
    })

    it('should fail if category type does not match transaction type', async () => {
      const incomeCategory = new Category({
        id: 'income-category-123',
        userId: 'user-123',
        name: 'Salary',
        type: CategoryType.INCOME
      })

      const request = {
        userId: 'user-123',
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'income-category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(incomeCategory)

      await expect(useCase.execute(request)).rejects.toThrow('Category type does not match transaction type')
    })

    it('should fail for zero or negative amounts', async () => {
      const zeroAmountRequest = {
        userId: 'user-123',
        description: 'Zero amount',
        amount: 0,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(mockCategory)

      await expect(useCase.execute(zeroAmountRequest)).rejects.toThrow('Transaction amount must be greater than zero')

      const negativeAmountRequest = {
        ...zeroAmountRequest,
        amount: -100
      }

      await expect(useCase.execute(negativeAmountRequest)).rejects.toThrow('Transaction amount must be greater than zero')
    })

    it('should fail for future date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const request = {
        userId: 'user-123',
        description: 'Future transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123',
        date: futureDate
      }

      mockCategoryRepo.findById.mockResolvedValue(mockCategory)

      await expect(useCase.execute(request)).rejects.toThrow('Transaction date cannot be in the future')
    })
  })

  describe('Error Handling', () => {
    it('should create failed transaction when processing fails', async () => {
      const request = {
        userId: 'user-123',
        description: 'Failed transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: 'category-123',
        accountId: 'account-123'
      }

      mockCategoryRepo.findById.mockResolvedValue(mockCategory)
      mockAccountRepo.findById.mockResolvedValue(mockAccount)
      mockAccountRepo.update.mockRejectedValue(new Error('Database error'))
      mockTransactionRepo.create.mockResolvedValue(expect.any(Object))

      await expect(useCase.execute(request)).rejects.toThrow('Database error')

      // Verify that a failed transaction was created
      expect(mockTransactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TransactionStatus.FAILED
        })
      )
    })
  })
})