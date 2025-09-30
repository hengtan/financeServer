import { Service, Inject } from 'typedi'
import { IReportRepository } from '../core/interfaces/repositories/IReportRepository'
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository'
import { IAccountRepository } from '../core/interfaces/repositories/IAccountRepository'
import { ICategoryRepository } from '../core/interfaces/repositories/ICategoryRepository'
import { Report, ReportType, ReportStatus, ReportFormat, ReportConfig, ReportData } from '../core/entities/Report'
import { RedisService } from '../infrastructure/cache/RedisService'
import { TransactionService } from './TransactionService'

export interface ReportGenerationOptions {
  userId: string
  name: string
  description?: string
  type: ReportType
  format: ReportFormat
  config: ReportConfig
  expiresInDays?: number
}

export interface FinancialSummaryData {
  period: {
    start: string
    end: string
  }
  totalIncome: number
  totalExpenses: number
  netIncome: number
  transactionsCount: number
  averageTransaction: number
  biggestIncome: {
    amount: number
    description: string
    date: string
  }
  biggestExpense: {
    amount: number
    description: string
    date: string
  }
}

export interface CategoryAnalysisData {
  summary: {
    totalIncome: number
    totalExpense: number
    netAmount: number
    transactionCount: number
  }
  categories: Array<{
    categoryId: string
    categoryName: string
    income: number
    expense: number
    net: number
    transactionCount: number
    incomePercentage: number
    expensePercentage: number
  }>
}

export interface MonthlyTrendData {
  monthlyTrend: Array<{
    year: number
    month: number
    monthName: string
    income: number
    expense: number
    net: number
    transactionCount: number
  }>
  averages: {
    monthlyIncome: number
    monthlyExpense: number
    monthlyNet: number
  }
}

@Service()
export class ReportService {
  constructor(
    @Inject('IReportRepository') private reportRepository: IReportRepository,
    @Inject('ITransactionRepository') private transactionRepository: ITransactionRepository,
    @Inject('IAccountRepository') private accountRepository: IAccountRepository,
    @Inject('ICategoryRepository') private categoryRepository: ICategoryRepository,
    private redisService: RedisService,
    private transactionService: TransactionService
  ) {}

  async createReport(options: ReportGenerationOptions): Promise<Report> {
    const report = new Report({
      userId: options.userId,
      name: options.name,
      description: options.description,
      type: options.type,
      format: options.format,
      config: options.config,
      status: ReportStatus.PENDING,
      expiresAt: options.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined
    })

    const createdReport = await this.reportRepository.create(report)

    // Process report asynchronously
    this.processReportAsync(createdReport.id).catch(error => {
      console.error('Error processing report:', error)
      this.reportRepository.markAsFailed(createdReport.id, error.message)
    })

    return createdReport
  }

  async getReportById(id: string, userId?: string): Promise<Report | null> {
    const cacheKey = `report:${id}`

    // Try cache first
    const cached = await this.redisService.get<Report>(cacheKey)
    if (cached && cached.id) {
      return cached
    }

    const report = await this.reportRepository.findById(id)

    // Validate ownership if userId provided
    if (report && userId && report.userId !== userId) {
      return null
    }

    if (report) {
      // Cache for 5 minutes
      await this.redisService.set(cacheKey, report, 300)
    }

    return report
  }

  async getReportsByUser(
    userId: string,
    options?: {
      type?: ReportType
      status?: ReportStatus
      format?: ReportFormat
      limit?: number
      offset?: number
    }
  ): Promise<{ reports: Report[]; total: number }> {
    const cacheKey = `reports:user:${userId}:${JSON.stringify(options || {})}`

    // Try cache first
    const cached = await this.redisService.get<{ reports: Report[]; total: number }>(cacheKey)
    if (cached && cached.reports) {
      return cached
    }

    const result = await this.reportRepository.findByUserId(userId, options)

    // Cache for 1 minute
    await this.redisService.set(cacheKey, result, 60)

    return result
  }

  async generateFinancialSummary(userId: string, year?: number, month?: number): Promise<FinancialSummaryData> {
    const currentDate = new Date()
    const targetYear = year || currentDate.getFullYear()
    const targetMonth = month

    const insights = await this.transactionService.getAdvancedInsights(userId)
    const categoryAnalysis = await this.transactionService.getCategoryAnalysis(userId, targetYear, targetMonth)

    const totalIncome = categoryAnalysis?.summary?.totalIncome || 0
    const totalExpenses = categoryAnalysis?.summary?.totalExpense || 0
    const transactionsCount = categoryAnalysis?.summary?.transactionCount || 0

    return {
      period: {
        start: targetMonth
          ? `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`
          : `${targetYear}-01-01`,
        end: targetMonth
          ? new Date(targetYear, targetMonth, 0).toISOString().split('T')[0]
          : `${targetYear}-12-31`
      },
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionsCount,
      averageTransaction: transactionsCount > 0 ? (totalIncome + totalExpenses) / transactionsCount : 0,
      biggestIncome: { amount: 0, description: 'Nenhuma receita', date: new Date().toISOString().split('T')[0] },
      biggestExpense: { amount: 0, description: 'Nenhuma despesa', date: new Date().toISOString().split('T')[0] }
    }
  }

  async generateCategoryAnalysis(userId: string, year?: number, month?: number): Promise<CategoryAnalysisData> {
    const currentDate = new Date()
    const targetYear = year || currentDate.getFullYear()

    const analysis = await this.transactionService.getCategoryAnalysis(userId, targetYear, month)

    return analysis || {
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        transactionCount: 0
      },
      categories: []
    }
  }

  async generateMonthlyTrend(userId: string): Promise<MonthlyTrendData> {
    const trendData = await this.transactionService.getTrendAnalysis(userId)

    return trendData || {
      monthlyTrend: [],
      averages: {
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlyNet: 0
      }
    }
  }

  async deleteReport(id: string, userId?: string): Promise<void> {
    const report = await this.reportRepository.findById(id)

    if (!report) {
      throw new Error('Report not found')
    }

    if (userId && report.userId !== userId) {
      throw new Error('Access denied')
    }

    await this.reportRepository.delete(id)

    // Clear cache
    await this.clearReportCache(id, report.userId)
  }

  async getReportStats(userId?: string) {
    return this.reportRepository.getStats(userId)
  }

  async cleanupExpiredReports(): Promise<number> {
    const expiredReports = await this.reportRepository.findExpired()

    for (const report of expiredReports) {
      // Clean up files if needed
      if (report.filePath) {
        // TODO: Implement file cleanup
      }
    }

    return this.reportRepository.deleteExpired()
  }

  async getPendingReports(): Promise<Report[]> {
    return this.reportRepository.findPending()
  }

  async getProcessingReports(): Promise<Report[]> {
    return this.reportRepository.findProcessing()
  }

  async searchReports(query: string, userId?: string): Promise<Report[]> {
    return this.reportRepository.searchByName(query, userId)
  }

  private async processReportAsync(reportId: string): Promise<void> {
    const report = await this.reportRepository.findById(reportId)
    if (!report) {
      throw new Error('Report not found')
    }

    try {
      // Mark as processing
      await this.reportRepository.markAsProcessing(reportId)

      let data: ReportData

      switch (report.type) {
        case ReportType.FINANCIAL_SUMMARY:
          data = {
            summary: await this.generateFinancialSummary(
              report.userId,
              report.config.filters.dateFrom?.getFullYear(),
              report.config.filters.dateFrom?.getMonth() ? report.config.filters.dateFrom.getMonth() + 1 : undefined
            )
          }
          break

        case ReportType.CATEGORY_ANALYSIS:
          data = {
            categories: [await this.generateCategoryAnalysis(
              report.userId,
              report.config.filters.dateFrom?.getFullYear(),
              report.config.filters.dateFrom?.getMonth() ? report.config.filters.dateFrom.getMonth() + 1 : undefined
            )]
          }
          break

        case ReportType.MONTHLY_TREND:
          data = {
            trends: [await this.generateMonthlyTrend(report.userId)]
          }
          break

        default:
          throw new Error(`Unsupported report type: ${report.type}`)
      }

      // Generate file if needed
      let fileUrl: string | undefined
      let filePath: string | undefined

      if (report.format !== ReportFormat.JSON) {
        // TODO: Implement file generation for PDF, Excel, CSV
        // For now, just store as JSON
      }

      // Mark as completed
      await this.reportRepository.markAsCompleted(reportId, data, fileUrl, filePath)

      // Clear cache
      await this.clearReportCache(reportId, report.userId)

    } catch (error) {
      await this.reportRepository.markAsFailed(reportId, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  private async clearReportCache(reportId: string, userId: string): Promise<void> {
    const patterns = [
      `report:${reportId}`,
      `reports:user:${userId}:*`,
      `report-stats:${userId}:*`
    ]

    for (const pattern of patterns) {
      await this.redisService.invalidatePattern(pattern)
    }
  }
}