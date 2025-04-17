import { parsePhone } from '@libs/parse-phone';
import { z } from 'zod';
import { SmsEncoding } from '@/types/queue-job';
import { env } from '@libs/configs';

export const a2pSchema = z
  .object({
    to: z.string().min(9).max(13),
    successCallbackUrl: z.string().url().optional(),
    errorCallbackUrl: z.string().url().optional(),
    callbacksHttpMethod: z.enum(['GET', 'POST']).optional(),
    text: z.string().min(1).max(1000),
    /**
     * `GSM` for standard, `Unicode` for emojis, etc. if user leaves this as
     * empty, the message type will be detected automatically
     */
    smsEncoding: z.nativeEnum(SmsEncoding),
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
