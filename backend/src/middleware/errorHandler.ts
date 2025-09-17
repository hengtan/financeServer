import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export interface AppError extends Error {
  statusCode: number
  isOperational: boolean
}

export class CustomError extends Error implements AppError {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as AppError
  error.message = err.message

  // Log do erro
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Erro de validação do Zod
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    error = new CustomError(`Erro de validação: ${message}`, 400)
  }

  // Erro de cast do MongoDB/Prisma
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado'
    error = new CustomError(message, 404)
  }

  // Erro de duplicata (MongoDB/Prisma)
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Recurso já existe'
    error = new CustomError(message, 400)
  }

  // Erro de validação
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message)
    error = new CustomError(`Erro de validação: ${message.join(', ')}`, 400)
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido'
    error = new CustomError(message, 401)
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado'
    error = new CustomError(message, 401)
  }

  // Resposta de erro
  const isDevelopment = process.env.NODE_ENV === 'development'

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Erro interno do servidor',
      ...(isDevelopment && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  })
}