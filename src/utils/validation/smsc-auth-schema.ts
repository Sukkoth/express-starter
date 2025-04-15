import { z } from 'zod';

export const smscAuthSchema = z.object({
  smscId: z.string().min(10).max(10),
  from: z.string().min(3).max(10),
  password: z.string().min(6).max(10),
  username: z.string().min(10).max(10),
  teamId: z.string().min(10).max(10),
  companyId: z.string().min(10).max(10),
});
