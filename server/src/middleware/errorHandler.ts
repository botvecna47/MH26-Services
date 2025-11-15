/**
 * Global Error Handler Middleware
 */
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    let statusCode = 400;
    let message = 'Database error occurred';

    // Handle specific Prisma error codes
    switch (prismaError.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Invalid reference to related record';
        break;
      default:
        message = prismaError.message || message;
    }

    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { 
        details: prismaError.message,
        code: prismaError.code,
      }),
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'ZodError') {
    res.status(400).json({
      error: 'Validation error',
      details: (err as any).errors,
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
