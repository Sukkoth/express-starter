import jwt from 'jsonwebtoken';
import Logger from '@libs/logger';
import { AppException } from '@libs/exceptions/app-exception';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import { env } from '@libs/configs';

const { JWT_SECRET } = env;

// Generate a JWT for a user
export const generateToken = () => {
  return jwt.sign('', JWT_SECRET, { expiresIn: '10d' });
};

// Verify a JWT
export const verifyToken = (token: string) => {
  try {
    const verification = jwt.verify(token, JWT_SECRET);
    return !!verification;
    //TODO take data from the verify method and check the credentials from do
  } catch (error) {
    Logger.error(ErrorCodes.INVALID_TOKEN, {
      message: 'Invalid or expired token',
      error,
    });
    throw new AppException({
      status: 401,
      message: 'Invalid or expired token',
      code: ErrorCodes.INVALID_TOKEN,
    });
  }
};
