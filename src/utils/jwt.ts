import jwt from 'jsonwebtoken';
import Logger from '@libs/logger';
import { AppException } from '@libs/exceptions/app-exception';
import { ErrorCodes } from '@libs/exceptions/error-codes';

const SECRET_KEY = process.env.JWT_SECRET || '';

// Generate a JWT for a user
export const generateToken = () => {
  if (!SECRET_KEY) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign('', SECRET_KEY, { expiresIn: '1h' });
};

// Verify a JWT
export const verifyToken = (token: string) => {
  try {
    // Needs to be interact with Database
    // return jwt.verify(token, SECRET_KEY);
    console.log('token', token);
    return true;
  } catch (error) {
    Logger.error(error);
    throw new AppException({
      status: 401,
      message: 'Invalid or expired token',
      code: ErrorCodes.INVALID_TOKEN,
    });
  }
};
