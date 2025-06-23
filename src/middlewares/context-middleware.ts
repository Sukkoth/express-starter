import { NextFunction, Request, Response } from 'express';
import { asyncLocalStorage } from '@libs/context';
import { randomUUID } from 'crypto';

export const contextMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Use an incoming X-Request-ID header or generate a new UUID
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  // Run the rest of the request pipeline in the context with { requestId }
  asyncLocalStorage.run({ requestId: id }, () => next());
};
