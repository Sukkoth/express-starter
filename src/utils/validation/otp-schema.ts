import { parsePhone } from '@libs/parse-phone';
import { z } from 'zod';
import { env } from '@libs/configs';
import { OtpCharacters } from '@/types/otp';

// TODO Start with email and you can add others like telegram later
/**
 * If this value is provided, in addition to sms message, the user will receive
 * otp through these channels.
 */
const additionalDeliveryChannelItem = z.object({
  provider: z.enum(['email'], {
    errorMap: () => ({
      message: 'Only email is supported as a delivery channel',
    }),
  }),
  address: z
    .string()
    .min(1, 'Email address is required')
    .email('Invalid email address'),
});

export const otpSchema = z
  .object({
    to: z.string().min(9).max(13),
    successCallbackUrl: z.string().url().optional(),
    errorCallbackUrl: z.string().url().optional(),
    callbacksHttpMethod: z.enum(['GET', 'POST']).optional(),
    /** When the message should expire */
    expireAt: z
      .number()
      .int()
      .positive()
      .refine(
        (v) => v >= Date.now() + env.SMS_EXPIRE_MINIMUM_DELAY_SECONDS * 1000,
        {
          message: 'expireAt must be at least 1 minute in the future',
        },
      )
      .optional(),
    /** Length of the OTP */
    length: z.number().int().positive().min(4).max(20).optional().default(4),
    /** Character set to use for the OTP */
    charSet: z
      .nativeEnum(OtpCharacters)
      .optional()
      .default(OtpCharacters.numeric),

    /**
     * If this value is provided, in addition to sms message, the user will
     * receive otp through these channels.
     */
    additionalDeliveryChannel: z
      .array(additionalDeliveryChannelItem)
      .optional()
      .transform((val) => {
        if (!val) return val;
        const seen = new Set<string>();
        return val.filter((item) => {
          const key = `${item.provider.toLowerCase()}:${item.address.toLowerCase()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }),
  })
  .superRefine((data, ctx) => {
    /** Parse and validate the phone number */
    const { data: phone, error } = parsePhone(data.to);
    if (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['to'],
        message: 'Invalid phone number',
      });
    } else {
      data.to = phone!.number;
    }
  });
