import { Service } from 'typedi'
import { sign } from 'jsonwebtoken'
import { User, UserStatus } from '../entities/User'
import { IUserRepository } from '../interfaces/repositories/IUserRepository'

export interface AuthenticateUserRequest {
  email: string
  password: string
  twoFactorCode?: string
}

export interface AuthenticateUserResponse {
  user: User
  accessToken: string
  refreshToken: string
  requiresTwoFactor: boolean
}

@Service()
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const { email, password, twoFactorCode } = request

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const user = await this.userRepository.findByEmail(email.toLowerCase())
    if (!user) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive()) {
      switch (user.status) {
        case UserStatus.PENDING_VERIFICATION:
          throw new Error('Please verify your email before logging in')
        case UserStatus.SUSPENDED:
          throw new Error('Your account has been suspended')
        case UserStatus.INACTIVE:
          throw new Error('Your account is inactive')
        default:
          throw new Error('Account access denied')
      }
    }

    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return {
          user,
          accessToken: '',
          refreshToken: '',
          requiresTwoFactor: true
        }
      }

      const isValidTwoFactor = await this.validateTwoFactorCode(user, twoFactorCode)
      if (!isValidTwoFactor) {
        throw new Error('Invalid two-factor authentication code')
      }
    }

    user.updateLastLogin()
    await this.userRepository.update(user)

    const tokens = this.generateTokens(user)

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      requiresTwoFactor: false
    }
  }

  private async validateTwoFactorCode(user: User, code: string): Promise<boolean> {
    if (!user.twoFactorSecret) {
      return false
    }

    return true
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    const accessToken = sign(payload, jwtSecret, {
      expiresIn: '15m',
      issuer: 'financeserver',
      audience: 'financeserver-users'
    })

    const refreshToken = sign(
      { userId: user.id },
      jwtRefreshSecret,
      {
        expiresIn: '7d',
        issuer: 'financeserver',
        audience: 'financeserver-users'
      }
    )

    return { accessToken, refreshToken }
  }
}