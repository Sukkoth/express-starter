import { MessageServiceType } from '@/types/queue-job';
import { DefaultJobOptions } from 'bullmq';

const a2pOptions: DefaultJobOptions = {
  removeOnFail: false,
  backoff: {
    type: 'exponential',
    delay: 3000,
  },
  /** It's okay to retry more as long as the user has not set the ttl explicitly */
  attempts: 18,
  /** Give a2p lower priority than OTP but will be higher than campaign */
  priority: 1,
};

const otpOptions: DefaultJobOptions = {
  removeOnFail: true,
  backoff: {
    type: 'exponential',
    delay: 3000,
  },
  /** This yields in 6:21 minute which is logical for OTP message */
  attempts: 7,
  /** Give otp higher priority */
  priority: 0,
};

/**
 * @param serviceType - {@link MessageServiceType} - The type of message service
 * @param options - {@link DefaultJobOptions} - Optional options to override the
 *   default options
 */
export function getJobOptions(
  serviceType: MessageServiceType,
  options?: DefaultJobOptions,
): DefaultJobOptions {
  if (serviceType === 'OTP') {
    return { keepLogs: 3, stackTraceLimit: 3, ...otpOptions, ...options };
  }
  // For A2P messages
  return { keepLogs: 3, stackTraceLimit: 3, ...a2pOptions, ...options };
}
