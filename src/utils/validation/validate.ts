import { ValidationException } from '@libs/exceptions/validation-exception';
import { ZodSchema, SafeParseReturnType } from 'zod';

/** Options to control the behavior of the `validate` function. */
type ValidateFnOptions = {
  /**
   * Whether to throw an exception if validation fails.
   *
   * - `true` (default): throws `ValidationException` on failure.
   * - `false`: returns the Zod parse result instead.
   */
  throwOnError?: boolean;
};

/**
 * Validates input data against a Zod schema.
 *
 * @param schema - The Zod schema used to validate the input.
 * @param data - The data to validate.
 * @param options - Optional settings to control validation behavior.
 * @returns If `throwOnError` is true or omitted, returns the validated data. If
 *   `throwOnError` is false, returns the full Zod parse result.
 * @throws {ValidationException} If validation fails and `throwOnError` is true.
 */
export default function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options?: ValidateFnOptions & { throwOnError?: true },
): T;

export default function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options: ValidateFnOptions & { throwOnError: false },
): SafeParseReturnType<unknown, T>;

// Implementation
export default function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options: ValidateFnOptions = { throwOnError: true },
): unknown {
  const result = schema.safeParse(data);
  if (options.throwOnError !== false) {
    if (!result.success) {
      throw new ValidationException({
        message: 'Validation error',
        violations: result.error.flatten().fieldErrors,
      });
    }
    return result.data;
  }
  return result;
}
