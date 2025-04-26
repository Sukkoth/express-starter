import { AppException } from '@libs/exceptions/app-exception';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import otpStore from './otp-store';
import Logger from '@libs/logger';
import { Otp } from '@/libs/prisma/generated';

type CommonOptions = {
  /** The phone number associated with the OTP. */
  phoneNumber: string;
  /** The sender identifier associated with the OTP. */
  from: string;
};

type ThrowWhenValid = CommonOptions & {
  /**
   * When you are trying to `GENERATE` you check if there is valid otp If there
   * is valid OTP you throw error
   */
  throwWhen: 'valid';
};

type ThrowWhenInvalid = CommonOptions & {
  /** When you are trying to `VERIFY` the otp you throw error if it is invalid */
  throwWhen: 'invalid';
};

type CheckOtpValidityOptions = ThrowWhenInvalid | ThrowWhenValid;

/**
 * Ensures no valid OTP exists for the given phone number and sender. Used
 * before generating a new OTP.
 *
 * @throws {AppException} If a valid OTP already exists or DB query fails.
 */
export async function checkAvailableOtp(options: ThrowWhenValid): Promise<void>;
/**
 * Ensures a valid OTP exists for the given phone number and sender. Used before
 * verifying an OTP.
 *
 * @returns The existing OTP if valid.
 * @throws {AppException} If no valid OTP exists or DB query fails.
 */
export async function checkAvailableOtp(
  options: ThrowWhenInvalid,
): Promise<Otp | null>;
export async function checkAvailableOtp({
  from,
  phoneNumber,
  throwWhen,
}: CheckOtpValidityOptions): Promise<void | Otp | null> {
  // Check if there is an otp associated with the phone and sender id
  const { data: existingOtp, error } = await otpStore.get(phoneNumber, from);
  if (error) {
    Logger.error(ErrorCodes.DB_QUERY_FAILED, {
      message: 'Failed to check OTP',
      error,
    });
    throw new AppException({
      status: 500,
      message: 'Failed to check OTP',
      code: ErrorCodes.DB_QUERY_FAILED,
    });
  }

  if ((!existingOtp || !existingOtp.is_valid) && throwWhen === 'invalid') {
    throw new AppException({
      status: 400,
      message: 'OTP is invalid', // means there is no record of valid otp
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  if (!existingOtp) return null;

  const now = Date.now();
  const expiresAt = Number(existingOtp!.expires_at);
  const isValid = existingOtp.is_valid && expiresAt > now;

  if (
    (isValid && throwWhen === 'valid') ||
    (!isValid && throwWhen === 'invalid')
  ) {
    throw new AppException({
      status: 400,
      message: isValid
        ? "Can't generate new OTP when there is valid entry"
        : 'OTP is invalid',
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  if (throwWhen === 'invalid') return existingOtp;
}
