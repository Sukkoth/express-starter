import messagingService from '@services/messaging-service';
import otpService from '@services/otp-service';
import { otpSchema, verifyOtpSchema } from '@utils/validation/otp-schema';
import validate from '@utils/validation/validate';
import asyncHandler from 'express-async-handler';
import { SmsEncoding } from '@/types/queue-job';
import { env } from '@libs/configs';

/**
 * Handles the sending of a One-Time Password (OTP).
 *
 * This function performs the following operations:
 *
 * 1. Validates the incoming request body against the OTP schema.
 * 2. Generates a new OTP and its hashed version.
 * 3. Stores the hashed OTP along with sender and recipient information.
 * 4. Adds the OTP message to the messaging queue for delivery.
 * 5. Responds with a success message and relevant data.
 *
 * @throws {ValidationError} If the request body fails schema validation.
 * @throws {Error} If OTP generation, storage, or queueing fails.
 */
const sendOTP = asyncHandler(async (req, res) => {
  /** Validate data */
  const data = validate(otpSchema, req.body);

  /** Generate plain otp and hashed version and store it */
  const { otp, hashedOtp } = otpService.generateOtp({
    length: data.length,
    charSet: data.charSet,
  });

  /** Store otp on datbase */
  const { messageId } = await otpService.storeOtp(
    hashedOtp,
    req.config!.from,
    data.to,
  );

  /** Add to queue */
  await messagingService.addToQueue({
    data: {
      ...{ ...data, length: undefined, charSet: undefined }, //remove length and charset from data
      text: otp,
      smsEncoding: SmsEncoding.GSM,
    },
    serviceType: 'OTP',
    config: req.config!,
  });

  /** Send response */
  res.json({
    success: true,
    message: 'OTP message sent successfully',
    data: {
      to: data.to,
      messageId,
      otp: env.NODE_ENV === 'development' ? otp : undefined,
      encryptedOtp: env.NODE_ENV === 'development' ? hashedOtp : undefined,
    },
  });
});

/**
 * Verifies the provided OTP for a given phone number.
 *
 * This function validates the request body against the `verifyOtpSchema`, then
 * uses the `otpService` to verify the OTP. If the OTP is valid, it responds
 * with a success message and the validated data.
 *
 * @returns A JSON response with a success message and the validated data.
 * @throws Will throw an error if the OTP validation fails or if the request
 *   body is invalid.
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const data = validate(verifyOtpSchema, req.body);

  await otpService.verifyOtp(data.otp, req.config!.from, data.phoneNumber);

  res.json({
    message: 'OTP is valid',
    data,
  });
});

export const otpController = {
  verifyOTP,
  sendOTP,
};
