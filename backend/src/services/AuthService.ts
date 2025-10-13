import { Service, Inject } from 'typedi'
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository'
import { IUserCategoryRepository } from '../core/interfaces/repositories/IUserCategoryRepository'
import { IAccountRepository } from '../core/interfaces/repositories/IAccountRepository'
import { User, UserRole, UserStatus } from '../core/entities/User'
import { RedisService } from '../infrastructure/cache/RedisService'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

interface LoginResult {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

@Service()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    @Inject('IUserCategoryRepository') private userCategoryRepository: IUserCategoryRepository,
    @Inject('IAccountRepository') private accountRepository: IAccountRepository,
    private redisService: RedisService
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    // Special handling for sandbox users
    if (email.includes('sandbox') && password === 'sandbox') {
      return this.handleSandboxLogin(email)
    }

    // Regular authentication flow
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive()) {
      throw new Error('Account is not active')
    }

    // Update last login
    user.updateLastLogin()
    await this.userRepository.update(user)

    // Generate tokens
    const tokens = await this.generateTokens(user)
    
    return {
      user,
      ...tokens
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      // Special handling for sandbox tokens
      if (token === 'sandbox_token_12345') {
        return await this.userRepository.findByEmail('sandbox@financeserver.dev')
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.redisService.get(`blacklist:${token}`)
      if (isBlacklisted) {
        return null
      }

      const secret = process.env.JWT_SECRET!
      const decoded = jwt.verify(token, secret) as any

      // Get user from cache first
      const cacheKey = `user:${decoded.userId}`
      const cached = await this.redisService.get<User>(cacheKey)

      if (cached && cached.id) {
        return cached
      }

      // Get from database
      const user = await this.userRepository.findById(decoded.userId)

      if (user && user.status === 'ACTIVE') {
        // Cache user for 5 minutes
        await this.redisService.set(cacheKey, user, 300)
        return user
      }

      return null
    } catch (error) {
      return null
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResult> {
    try {
      const secret = process.env.JWT_REFRESH_SECRET!
      const decoded = jwt.verify(refreshToken, secret) as any
      
      const user = await this.userRepository.findById(decoded.userId)
      if (!user || user.status !== 'ACTIVE') {
        throw new Error('Invalid refresh token')
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user)
      
      return {
        user,
        ...tokens
      }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  async logout(token: string): Promise<void> {
    // Add token to blacklist
    const decoded = jwt.decode(token) as any
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await this.redisService.set(`blacklist:${token}`, 'true', ttl)
      }
    }
  }

  async register(userData: {
    name: string
    email: string
    password: string
  }): Promise<User> {
    // Check if user already exists
    const existing = await this.userRepository.findByEmail(userData.email)
    if (existing) {
      throw new Error('User already exists with this email')
    }

    // Create user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: UserRole.USER
    })

    // Mark as verified and active for demo
    user.markEmailAsVerified()

    // Save to repository
    const savedUser = await this.userRepository.create(user)

    // 🚀 AUTOMATIC ONBOARDING: Initialize user resources asynchronously
    // This ensures scalability - runs in background without blocking registration response
    this.initializeUserResources(savedUser.id).catch(error => {
      console.error(`❌ Failed to initialize resources for user ${savedUser.id}:`, error)
      // Log error but don't fail registration - resources can be created on-demand later
    })

    return savedUser
  }

  /**
   * 🚀 SCALABLE ONBOARDING: Initialize default resources for new users
   * Runs asynchronously to avoid blocking registration
   * Supports 1000+ registrations/minute by not waiting for resource creation
   */
  private async initializeUserResources(userId: string): Promise<void> {
    try {
      console.log(`🎯 Initializing resources for user ${userId}...`)

      // 1. Create default UserCategories from templates
      await this.createDefaultUserCategories(userId)

      // 2. Create default Account - DISABLED
      // User will create their own accounts as needed
      // await this.createDefaultAccount(userId)

      console.log(`✅ Resources initialized successfully for user ${userId}`)
    } catch (error) {
      console.error(`❌ Error initializing resources for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Create UserCategories from CategoryTemplates for a new user
   */
  private async createDefaultUserCategories(userId: string): Promise<void> {
    // Get CategoryTemplates (this should be injected, but for now we'll use Prisma directly)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const templates = await prisma.categoryTemplate.findMany({
        where: { isDefault: true }
      })

      console.log(`📋 Found ${templates.length} category templates`)

      // Create UserCategories in parallel for speed
      await Promise.all(
        templates.map(template =>
          this.userCategoryRepository.create({
            userId,
            categoryTemplateId: template.id,
            name: template.name,
            type: template.type as any,
            color: template.color || undefined,
            icon: template.icon || undefined,
            isActive: true,
            isCustom: false,
            tags: template.tags || [],
            status: 'ACTIVE' as any
          } as any)
        )
      )

      console.log(`✅ Created ${templates.length} user categories`)
    } finally {
      await prisma.$disconnect()
    }
  }

  /**
   * Create a default checking account for a new user
   */
  private async createDefaultAccount(userId: string): Promise<void> {
    const { Account } = await import('../core/entities/Account')
    const { Decimal } = await import('decimal.js')

    const account = new Account({
      userId,
      name: 'Conta Principal',
      type: 'CHECKING' as any,
      balance: new Decimal(0),
      currency: 'BRL',
      status: 'ACTIVE' as any,
      isDefault: true,
      description: 'Conta criada automaticamente'
    })

    await this.accountRepository.create(account)
    console.log(`✅ Created default account for user ${userId}`)
  }

  async updateProfile(userId: string, data: {
    name?: string
    avatarUrl?: string
    phoneNumber?: string
  }): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Update user properties
    if (data.name) Object.assign(user, { name: data.name })
    if (data.avatarUrl) Object.assign(user, { avatarUrl: data.avatarUrl })
    if (data.phoneNumber) Object.assign(user, { phoneNumber: data.phoneNumber })

    const updatedUser = await this.userRepository.update(user)

    // Clear user cache
    await this.redisService.del(`user:${userId}`)

    return updatedUser
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(currentPassword)
    if (!isValidPassword) {
      throw new Error('Current password is incorrect')
    }

    // Change password using User method
    await user.changePassword(newPassword)

    // Update in repository
    await this.userRepository.update(user)

    // Clear user cache
    await this.redisService.del(`user:${userId}`)
  }

  private async handleSandboxLogin(email: string): Promise<LoginResult> {
    // Create or get sandbox user
    let user = await this.userRepository.findByEmail('sandbox@financeserver.dev')
    
    if (!user) {
      // Create sandbox user
      user = await User.create({
        name: 'Usuário Sandbox',
        email: 'sandbox@financeserver.dev',
        password: 'sandbox',
        role: UserRole.USER,
        metadata: { sandbox: true }
      })

      // Mark as verified and active
      user.markEmailAsVerified()

      // Save to repository
      user = await this.userRepository.create(user)
    }

    // Generate sandbox tokens
    return {
      user,
      token: 'sandbox_token_12345',
      refreshToken: 'sandbox_refresh_token_67890',
      expiresIn: 3600
    }
  }

  private async generateTokens(user: User): Promise<{
    token: string
    refreshToken: string
    expiresIn: number
  }> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    const jwtSecret = process.env.JWT_SECRET!
    const refreshSecret = process.env.JWT_REFRESH_SECRET!
    
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' })
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' })
    
    return {
      token,
      refreshToken,
      expiresIn: 3600
    }
  }
}