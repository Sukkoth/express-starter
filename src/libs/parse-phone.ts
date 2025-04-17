import { parsePhoneNumberWithError } from 'libphonenumber-js';

type ParsePhoneResult =
  | {
      data: {
        number: string;
        provider: 'ethio_telecom' | 'safaricom';
      };
      error: null;
    }
  | {
      data: null;
      error: string;
    };

/**
 * Parses and validates a phone number using libphonenumber-js.
 *
 * If the number is valid, returns the number in E.164 format and identifies the
 * provider based on the national number. Numbers starting with '9' are assumed
 * to belong to 'ethio_telecom', others to 'safaricom'.
 *
 * @example
 *   const result = parsePhone('+251912345678');
 *   if (result.error) {
 *     console.error(result.error);
 *   } else {
 *     console.log(result.data?.number); // "+251912345678"
 *     console.log(result.data?.provider); // "ethio_telecom"
 *   }
 *
 * @param {string} phoneNumber - The phone number to parse and validate.
 * @returns Data - {@link ParsePhoneResult} - An object containing the parsed
 *   number and provider, or an error message.
 */

export function parsePhone(phoneNumber: string): ParsePhoneResult {
  const result = parsePhoneNumberWithError(phoneNumber, 'ET');
  if (!result.isValid()) {
    return {
      data: null,
      error: 'Invalid phone number',
    };
  }
  return {
    data: {
      number: result.number,
      provider: result.nationalNumber.startsWith('9')
        ? 'ethio_telecom'
        : 'safaricom',
    },
    error: null,
  };
}
