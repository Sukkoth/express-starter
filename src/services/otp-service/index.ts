import encryption from '@libs/encryption';
import { AppException } from '@libs/exceptions/app-exception';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import { OtpCharacters } from '@/types/otp';
import otp from '@libs/otp';
import otpStore from './otp-store';
import { checkAvailableOtp } from './check-available-otp';

/**
 * Verifies the provided OTP against the stored value in the database.
 *
 * @param otp - The OTP provided by the user for verification.
 * @param from - The source or sender identifier associated with the OTP.
 * @param phoneNumber - The phone number associated with the OTP.
 * @returns A promise that resolves to `true` if the OTP is valid.
 * @throws {AppException} - If there is a database query failure or the OTP is
 *   invalid.
 * @remark - Why throw 400 instead of 401? 401 is when the request between the
 *       servers is unauthorized. But here, the server successfully passed the
 *       authorization logic but the request is invalid.
 */
async function verifyOtp(otp: string, from: string, phoneNumber: string) {
  const existingData = await checkAvailableOtp({
    phoneNumber,
    from,
    throwWhen: 'invalid',
  });

  if (!existingData || !encryption.compareHash(otp, existingData.otp)) {
    throw new AppException({
      status: 400,
      message: 'Invalid OTP',
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const { data, error } = await otpStore.update(existingData.id, {
    is_valid: false,
  });
  if (error || !data) {
    throw new AppException({
      status: 500,
      message: 'Failed to check OTP',
      code: ErrorCodes.DB_QUERY_FAILED,
    });
  }

  return true;
}

/**
 * Stores a one-time password (OTP) in the database and returns the associated
 * message ID.
 *
 * @param otp - The one-time password to be stored.
 * @param from - The sender identifier (e.g., service or application name).
 * @param phoneNumber - The recipient's phone number.
 * @returns A promise that resolves to an object containing the message ID.
 * @throws {AppException} Throws an exception if storing the OTP fails.
 */
async function storeOtp(otp: string, from: string, phoneNumber: string) {
  //create here if there is no otp associated with the phone and sender id
  await checkAvailableOtp({
    phoneNumber,
    from,
    throwWhen: 'valid',
  });

  const { data: otpData, error: storingError } = await otpStore.store({
    otp,
    from,
    phoneNumber,
  });
  if (storingError || !otpData) {
    throw new AppException({
      status: 500,
      message: 'Failed to store OTP',
      code: ErrorCodes.DB_QUERY_FAILED,
    });
  }
  return { messageId: otpData.id };
}

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
function generateOtp(options: GenerateOtpOptions = {}) {
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

export default {
  generateOtp,
  storeOtp,
  verifyOtp,
};
