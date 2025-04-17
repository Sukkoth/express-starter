import { ErrorCodes } from '@libs/exceptions/error-codes';

type ValidationExceptionParams = {
  message: string;
  violations: unknown;
  cause?: Error;
};

/**
 * Advanced custom error class The stack trace is only available in development
 * mode and set automatically. The cause is also only available in development
 * mode but you need to pass the Error instance.
 *
 * @example
 *   ```ts
 *   const result = validate(a2pSchema, req.body, {
 *     throwOnError: false,
 *   });
 *
 *   if (!result.success) {
 *     throw new ValidationException({
 *       message: 'Validation error',
 *       violations: result.error.flatten().fieldErrors,
 *     });
 *   }
 *   ```;
 */
export class ValidationException extends Error {
  public readonly status: number;
  public readonly message: string;
  public readonly violations: unknown;
  public readonly stack!: string;
  public readonly code?: string;
  public readonly cause?: Error;

  constructor({ message, cause, violations }: ValidationExceptionParams) {
    // -- initialize
    super(message);
    this.status = 422;
    this.code = ErrorCodes.VALIDATION_ERROR;
    this.message = message;
    this.cause = cause;
    this.violations = violations;

    // This maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ValidationException);
  }
}
