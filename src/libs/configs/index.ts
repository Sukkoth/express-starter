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
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  DB_URL: z.string().url().default('postgres://localhost:5432/mydb'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET is required'),
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
