import { OtpCharacters } from '@/types/otp';
import encryption from '@libs/encryption';
import { AppException } from '@libs/exceptions/app-exception';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import otp from '@libs/otp';

type GenerateOtpOptions = {
  /** The length of the OTP to generate. Defaults to 4. */
  length?: number;
  /** The character set to use for the OTP. Defaults to numeric characters. */
  charSet?: OtpCharacters;
};

/**
 * Generates a one-time password (OTP) and its hashed counterpart.
 *
 * @property {string} otp - The generated OTP.
 * @property {string} hashedOtp - The hashed version of the generated OTP.
 * @param options {@link GenerateOtpOptions} - Configuration options for OTP
 *   generation.
 * @returns An object containing the generated OTP and its hashed version.
 */
export function generateOtp(options: GenerateOtpOptions = {}) {
  /** Generate the actual plain OTP */
  const generatedOtp = otp.generateOtp(
    options.length ?? 4,
    options.charSet ?? OtpCharacters.numeric,
  );

  /**
   * Generate hashed otp because the data we store in db should be secure. But
   * you still need to send the user a plain text
   */
  const hashedOtp = encryption.hash(generatedOtp);

  return {
    /** The generated otp data */
    otp: generatedOtp,
    /** The hashed otp data */
    hashedOtp,
  };
}

export async function storeOtp(otp: string, from: string, phoneNumber: string) {
  //store otp
  console.log({ otp, from, phoneNumber });
  return { messageId: '1234567890' };
}

export async function verifyOtp(
  otp: string,
  from: string,
  phoneNumber: string,
) {
  console.log({ from, phoneNumber });
  // TODO replace this with actual db fetching and remove these static values
  //fetch from db
  const hashedDataFromDb =
    '$2a$10$f7.NmYVKNNcFMI1daoowxucOsPDOw.ezSiWH.jpogPYknjV8CSLPC'; //the matching otp is 2848

  //if not found, throw error
  if (!hashedDataFromDb) {
    throw new AppException({
      status: 400,
      message: 'Invalid OTP',
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  //else compare hash
  const hashMatches = encryption.compareHash(otp, hashedDataFromDb);

  /**
   * Why throw 400 instead of 401? 401 is when the request between the servers
   * is unauthorized. But here, the server successfully passed the authorization
   * logic but the request is invalid.
   */
  if (!hashMatches) {
    throw new AppException({
      status: 400,
      message: 'Invalid OTP',
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  return hashMatches;
}

export default {
  generateOtp,
  storeOtp,
  verifyOtp,
};
