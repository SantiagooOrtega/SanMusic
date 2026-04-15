import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../dto/ApiResponse';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  const msg = err.message || 'Internal server error';
  let statusCode = 500;

  if (msg.includes('not found')) statusCode = 404;
  else if (msg.includes('Duplicate')) statusCode = 409;
  else if (msg.includes('required') || msg.includes('must be') || msg.includes('invalid')) statusCode = 400;
  else if (msg.includes('not currently')) statusCode = 422;

  const response: ApiResponse<null> = { success: false, error: msg };
  res.status(statusCode).json(response);
}
