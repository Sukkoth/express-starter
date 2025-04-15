import { SmscConfig } from '@/types/queue-job';

declare global {
  namespace Express {
    interface Request {
      config?: SmscConfig; // Add user property to Request
    }
  }
}
