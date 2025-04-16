/**
 * Environment Variables Schema Definition
 * ---------------------------------------
 * This module defines and validates the required environment variables using Zod.
 *
 * Why use this?
 * - Ensures all required environment variables are present at runtime
 * - Catches misconfigurations early (e.g., missing or invalid values)
 * - Applies default values where applicable (only if the variable is not set)
 * - Casts and sanitizes types (e.g., ports from string to number)
 *
 * Usage:
 * - `env` is the validated and parsed version of `process.env`
 * - Use `env.APP_PORT`, `env.DB_URL`, etc., safely throughout the app
 *
 * Behavior:
 * - If validation fails, the app logs the error and exits immediately
 * - If a variable is not provided but has a default, the default will be used
 *
 * Extendability:
 * - You can safely add more variables (e.g., Redis, Sentry) by updating the schema
 *
 * Example:
 * ```ts
 * import { env } from './env'
 * console.log(`Running on ${env.BASE_URL} in ${env.NODE_ENV} mode`)
 * ```
 */

import { z } from 'zod';

export const envSchema = z.object({
  /**
   * The environment the app is running in.
   */
  NODE_ENV: z
    .enum(['development', 'production', 'staging', 'test'])
    .default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  /**
   * The base URL of the app.
   */
  BASE_URL: z.string().url().default('http://localhost:3000'),
  DB_URL: z.string().url().default('postgres://localhost:5432/mydb'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET is required'),
  /**
   * The maximum number of seconds to wait for a job to be added to the queue before timing out.
   */
  QUEUE_ADD_RETRY_SECONDS: z.coerce.number().int().positive().default(4),
  /**
   * The maximum number of chunks allowed for an SMS message.
   */
  MAX_SMS_CHUNKS: z.coerce.number().int().positive().default(6),
  /**
   * Minimum number of seconds before an SMS message is considered expired.
   * Ensures messages aren't scheduled to expire immediately after creation. */
  SMS_EXPIRE_MINIMUM_DELAY_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60),
});

// Validate and parse process.env at runtime
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

/**
 * @example
 * ```ts
 * import { env } from './env'
 * console.log(`Running on ${env.BASE_URL} in ${env.NODE_ENV} mode`)
 * ```
 */
export const env = parsed.data;
