import { ErrorCodes } from '@libs/exceptions/error-codes';

type AppExceptionParams = {
  status: number;
  message: string;
  code?: ErrorCodes;
  cause?: Error;
};

/**
 * The stack trace is only available in development mode and set automatically.
 * The cause is also only available in development mode but you need to pass the
 * Error instance.
 *
 * @example
 *   ```ts
 *   try {
 *   await stripeClient.charges.create({ amount });
 *   } catch (stripeError) {
 *   throw new AppException({
 *   status: 400,
 *   code: 'PAYMENT_FAILED',
 *   message: 'Payment processing failed',
 *   cause: stripeError
 *   });
 *   }
 */
export class AppException extends Error {
  public readonly status: number;
  public readonly message: string;
  public readonly stack!: string;
  public readonly code?: ErrorCodes;
  public readonly cause?: Error;

  constructor({ status, message, code, cause }: AppExceptionParams) {
    if (!status || typeof status !== 'number' || status < 100 || status > 599) {
      throw new Error('Invalid status code');
    }

    super(message);
    this.status = status;
    this.code = code;
    this.message = message;
    this.cause = cause;

    Error.captureStackTrace(this, AppException);
  }

  public static badRequest(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({ status: 400, ...params });
  }

  public static unauthenticated(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({
      status: 401,
      code: ErrorCodes.UNAUTHENTICATED,
      ...params,
    });
  }

  public static paymentRequired(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({
      status: 402,
      code: ErrorCodes.PAYMENT_REQUIRED,
      ...params,
      message:
        'Insufficient balance. Please recharge to continue using the service',
    });
  }

  public static unauthorized(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({
      status: 403,
      code: ErrorCodes.UNAUTHORIZED,
      ...params,
    });
  }

  public static notFound(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({
      status: 404,
      code: ErrorCodes.NOT_FOUND,
      ...params,
    });
  }

  public static methodNotAllowed(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({
      status: 405,
      code: ErrorCodes.METHOD_NOT_ALLOWED,
      ...params,
    });
  }

  public static tooManyRequests(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({
      status: 429,
      code: ErrorCodes.TOO_MANY_REQUESTS,
      ...params,
    });
  }

  public static internalServerError(
    params: Omit<AppExceptionParams, 'status' | 'code'>,
  ): AppException {
    return new AppException({
      status: 500,
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      ...params,
    });
  }

  public static badGateway(
    params: Omit<AppExceptionParams, 'status'>,
  ): AppException {
    return new AppException({ status: 502, ...params });
  }

  public static serviceUnavailable(
    params: Omit<AppExceptionParams, 'status'>,
  ): AppException {
    return new AppException({ status: 503, ...params });
  }

  public static gatewayTimeout(
    params: Omit<AppExceptionParams, 'status'>,
  ): AppException {
    return new AppException({ status: 504, ...params });
  }
}
