import { parsePhone } from '@libs/parse-phone';
import { z } from 'zod';
import { SmsType } from '@/types/queue-job';

export const a2pSchema = z
  .object({
    to: z.string().min(9).max(13),
    callbackUrl: z.string().url().optional(),
    body: z.string().min(1).max(1000),
    smsType: z.nativeEnum(SmsType),
  })
  .superRefine((data, ctx) => {
    //phone number
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
