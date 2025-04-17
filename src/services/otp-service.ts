import { OtpCharacters } from '@/types/otp';
import encryption from '@libs/encryption';
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
  console.log({ otp, from, phoneNumber });
  //fetch from db

  //if not found, throw error

  //else decrypt and compare

  return true;
}

export default {
  generateOtp,
  storeOtp,
  verifyOtp,
};
