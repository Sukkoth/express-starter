import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@utils/jwt';
import { AppException } from '@libs/exceptions/app-exception';
import validate from '@utils/validation/validate';
import { smscAuthSchema } from '@utils/validation/smsc-auth-schema';

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  //TODO replace this with actual db checking

  const { data, success } = validate(
    smscAuthSchema,
    {
      smscId: '1234567890',
      from: '1234567890',
      password: '1234567890',
      username: '1234567890',
      teamId: '1234567890',
      companyId: '1234567890',
    },
    {
      throwOnError: false,
    },
  );

  if (!success) {
    throw AppException.unauthenticated({
      message: 'Invalid client configuration',
    });
  }

  if (!token) {
    throw AppException.unauthenticated({
      message: 'Unauthorized',
    });
  }

  verifyToken(token); //implement this well
  req.config = data;
  next();
};
