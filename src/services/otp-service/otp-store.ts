/**
 * This file is where you should put datbase operations here that are related to
 * otp
 */

import { prisma } from '@libs/prisma';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import Logger from '@libs/logger';
import { TryCatch } from '@/types/types';
import { Otp } from '@/libs/prisma/generated';

/**
 * Fetches an OTP record from the database based on the provided phone number
 * and sender.
 *
 * @param phoneNumber - The phone number to which the OTP was sent.
 * @param from - The sender of the OTP.
 * @returns An object containing either the OTP data or an error if the query
 *   fails.
 */
async function getOtpFromDb(
  phoneNumber: string,
  from: string,
): Promise<TryCatch<Otp>> {
  try {
    const data = await prisma.otp.findFirst({
      where: {
        to: phoneNumber,
        from,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return { data, error: null };
  } catch (error) {
    Logger.error(ErrorCodes.DB_QUERY_FAILED, {
      message: 'Failed to fetch OTP',
      error,
    });
    return { data: null, error };
  }
}

type StoreOtpProps = {
  otp: string;
  from: string;
  phoneNumber: string;
};

/**
 * Stores an OTP in the database.
 *
 * @param {StoreOtpProps} params - The parameters required to store the OTP.
 * @param {string} params.otp - The OTP to be stored.
 * @param {string} params.from - The sender identifier.
 * @param {string} params.phoneNumber - The recipient's phone number.
 * @throws {Error} Logs and returns an error if the database query fails.
 */
async function storeOtpOnDb({ otp, from, phoneNumber }: StoreOtpProps) {
  try {
    const now = new Date().getTime();
    const data = await prisma.otp.create({
      data: {
        otp,
        from,
        to: phoneNumber,
        expires_at: now + 10 * 60 * 1000, //expires after 10 minutes
        updated_at: now,
        created_at: now,
      },
    });
    return { data, error: null };
  } catch (error) {
    Logger.error(ErrorCodes.DB_QUERY_FAILED, {
      message: 'Failed to store OTP',
      error,
    });
    return { data: null, error };
  }
}

async function updateOtp(id: string, otp: Partial<Otp>) {
  try {
    const data = await prisma.otp.update({
      where: {
        id,
      },
      data: otp,
    });
    return { data, error: null };
  } catch (error) {
    Logger.error(ErrorCodes.DB_QUERY_FAILED, {
      message: 'Failed to update OTP',
      error,
    });
    return { data: null, error };
  }
}

/**
 * A service for managing OTP (One-Time Password) operations.
 *
 * @property {Function} get - Retrieves an OTP from the database.
 * @property {Function} store - Stores an OTP in the database.
 */
export default {
  get: getOtpFromDb,
  store: storeOtpOnDb,
  update: updateOtp,
};
