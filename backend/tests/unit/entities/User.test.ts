import { User, UserRole, UserStatus } from '../../../src/core/entities/User'

describe('User Entity', () => {
  describe('Constructor', () => {
    it('should create a user with default values', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }

      const user = await User.create(userData)

      expect(user.name).toBe('John Doe')
      expect(user.email).toBe('john@example.com')
      expect(user.role).toBe(UserRole.USER)
      expect(user.status).toBe(UserStatus.PENDING_VERIFICATION)
      expect(user.twoFactorEnabled).toBe(false)
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should create a user with custom role', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.ADMIN
      }

      const user = await User.create(userData)

      expect(user.role).toBe(UserRole.ADMIN)
    })

    it('should hash the password during creation', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plaintext'
      }

      const user = await User.create(userData)
      const isValid = await user.validatePassword('plaintext')
      const isInvalid = await user.validatePassword('wrongpassword')

      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })
  })

  describe('Validation', () => {
    it('should throw error for invalid name', async () => {
      const userData = {
        name: 'A',
        email: 'test@example.com',
        password: 'password123'
      }

      await expect(User.create(userData)).rejects.toThrow('User name must be at least 2 characters long')
    })

    it('should throw error for invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      await expect(User.create(userData)).rejects.toThrow('Valid email is required')
    })

    it('should throw error for short password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      }

      await expect(User.create(userData)).rejects.toThrow('Password must be at least 6 characters long')
    })
  })

  describe('Password Management', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'oldpassword'
      })
    })

    it('should validate correct password', async () => {
      const isValid = await user.validatePassword('oldpassword')
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const isValid = await user.validatePassword('wrongpassword')
      expect(isValid).toBe(false)
    })

    it('should change password successfully', async () => {
      await user.changePassword('newpassword123')

      const oldPasswordValid = await user.validatePassword('oldpassword')
      const newPasswordValid = await user.validatePassword('newpassword123')

      expect(oldPasswordValid).toBe(false)
      expect(newPasswordValid).toBe(true)
    })

    it('should throw error for short new password', async () => {
      await expect(user.changePassword('123')).rejects.toThrow('Password must be at least 6 characters long')
    })
  })

  describe('Email Verification', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should mark email as verified', () => {
      expect(user.isVerified()).toBe(false)

      user.markEmailAsVerified()

      expect(user.isVerified()).toBe(true)
      expect(user.status).toBe(UserStatus.ACTIVE)
      expect(user.emailVerifiedAt).toBeInstanceOf(Date)
    })

    it('should throw error if email already verified', () => {
      user.markEmailAsVerified()

      expect(() => user.markEmailAsVerified()).toThrow('Email is already verified')
    })
  })

  describe('Two-Factor Authentication', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should enable 2FA', () => {
      const secret = 'test-2fa-secret'

      user.enable2FA(secret)

      expect(user.twoFactorEnabled).toBe(true)
      expect(user.twoFactorSecret).toBe(secret)
    })

    it('should disable 2FA', () => {
      user.enable2FA('test-secret')
      user.disable2FA()

      expect(user.twoFactorEnabled).toBe(false)
      expect(user.twoFactorSecret).toBeUndefined()
    })

    it('should throw error when enabling 2FA twice', () => {
      user.enable2FA('test-secret')

      expect(() => user.enable2FA('another-secret')).toThrow('Two-factor authentication is already enabled')
    })

    it('should throw error when disabling 2FA if not enabled', () => {
      expect(() => user.disable2FA()).toThrow('Two-factor authentication is not enabled')
    })
  })

  describe('User Status Management', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      user.markEmailAsVerified() // Make user active
    })

    it('should suspend user', () => {
      user.suspend()

      expect(user.status).toBe(UserStatus.SUSPENDED)
      expect(user.isActive()).toBe(false)
    })

    it('should activate suspended user', () => {
      user.suspend()
      user.activate()

      expect(user.status).toBe(UserStatus.ACTIVE)
      expect(user.isActive()).toBe(true)
    })

    it('should throw error when suspending already suspended user', () => {
      user.suspend()

      expect(() => user.suspend()).toThrow('User is already suspended')
    })

    it('should throw error when activating already active user', () => {
      expect(() => user.activate()).toThrow('User is already active')
    })
  })

  describe('Premium Upgrade', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should upgrade to premium', () => {
      user.upgradeToPremium()

      expect(user.role).toBe(UserRole.PREMIUM)
      expect(user.isPremium()).toBe(true)
    })

    it('should throw error when upgrading already premium user', () => {
      user.upgradeToPremium()

      expect(() => user.upgradeToPremium()).toThrow('User is already premium')
    })
  })

  describe('Role Checks', () => {
    it('should identify admin user', async () => {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.ADMIN
      })

      expect(admin.isAdmin()).toBe(true)
      expect(admin.isPremium()).toBe(false)
    })

    it('should identify premium user', async () => {
      const premium = await User.create({
        name: 'Premium',
        email: 'premium@example.com',
        password: 'password123',
        role: UserRole.PREMIUM
      })

      expect(premium.isPremium()).toBe(true)
      expect(premium.isAdmin()).toBe(false)
    })
  })

  describe('Login Tracking', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should update last login', () => {
      const beforeLogin = new Date()

      user.updateLastLogin()

      expect(user.lastLoginAt).toBeInstanceOf(Date)
      expect(user.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime())
    })
  })

  describe('Audit and JSON Serialization', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should generate audit log', () => {
      const auditLog = user.toAuditLog()

      expect(auditLog).toEqual({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: undefined,
        emailVerifiedAt: undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })
    })

    it('should serialize to JSON without password', () => {
      const json = user.toJSON()

      expect(json).toHaveProperty('id')
      expect(json).toHaveProperty('name')
      expect(json).toHaveProperty('email')
      expect(json).toHaveProperty('role')
      expect(json).not.toHaveProperty('password')
      expect(json).not.toHaveProperty('passwordHash')
    })
  })
})