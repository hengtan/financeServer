import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:3001'

export const authHandlers = [
  // Login
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as any

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
            status: 'ACTIVE'
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600
        },
        message: 'Login realizado com sucesso'
      })
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Credenciais inválidas',
        errors: ['Email ou senha incorretos']
      },
      { status: 401 }
    )
  }),

  // Register
  http.post(`${API_BASE_URL}/api/auth/register`, async ({ request }) => {
    const body = await request.json() as any

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Este email já está em uso',
          errors: ['Email já cadastrado']
        },
        { status: 409 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 'user-new',
          name: body.name,
          email: body.email,
          role: 'USER',
          status: 'PENDING_VERIFICATION'
        },
        message: 'Usuário criado com sucesso'
      },
      { status: 201 }
    )
  }),

  // Get current user
  http.get(`${API_BASE_URL}/api/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Token inválido ou expirado'
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    })
  }),

  // Logout
  http.post(`${API_BASE_URL}/api/auth/logout`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Token não fornecido'
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
  }),

  // Refresh token
  http.post(`${API_BASE_URL}/api/auth/refresh`, async ({ request }) => {
    const body = await request.json() as any

    if (body.refreshToken === 'mock-refresh-token') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'new-mock-jwt-token',
          refreshToken: 'new-mock-refresh-token',
          expiresIn: 3600
        }
      })
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Refresh token inválido ou expirado'
      },
      { status: 401 }
    )
  })
]