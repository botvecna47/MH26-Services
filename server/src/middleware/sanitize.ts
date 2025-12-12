import { Request, Response, NextFunction } from 'express';

/**
 * Sanitization Middleware
 * Recursively cleans input data:
 * - Trims strings
 * - Converts empty strings to null
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
}

function sanitize(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    return trimmed === '' ? null : trimmed;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = sanitize(obj[key]);
    }
    return result;
  }

  return obj;
}
