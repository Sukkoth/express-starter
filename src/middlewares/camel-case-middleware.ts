import { NextFunction, Request, Response } from 'express';

/**
 * Converts a snake_case string to camelCase.
 *
 * @param {string} str - The input string in snake_case.
 * @returns {string} The converted string in camelCase.
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Recursively converts all object keys from snake_case to camelCase.
 *
 * @param {unknown} obj - The object to transform.
 * @returns {unknown} The transformed object with camelCase keys.
 */
function keysToCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        keysToCamelCase(value),
      ]),
    );
  }

  return obj;
}

/**
 * Express middleware that transforms incoming request body keys from snake_case to camelCase.
 *
 * ⚠️ Temporary compatibility layer for v1 clients still using snake_case.
 * This should be removed once all clients are fully migrated to API v2.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Callback to pass control to the next middleware.
 */
export function camelCaseMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body && typeof req.body === 'object') {
    const originalKeys = Object.keys(req.body);
    const hasSnakeCase = originalKeys.some((key) => key.includes('_'));

    if (hasSnakeCase) {
      res.setHeader(
        'X-API-Warning',
        'snake_case keys are deprecated and will be removed in v2. Use camelCase instead.',
      );
    }

    req.body = keysToCamelCase(req.body);
  }

  next();
}
