import { apiQueue } from '@/queues';
import { QueueJob } from '@/types/queue-job';
import { env } from '@libs/configs';
import { AppException } from '@libs/exceptions/app-exception';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import Logger from '@libs/logger';

/**
 * Adds a job to the BullMQ queue with a timeout wrapper to handle Redis delays.
 *
 * @param {string} jobName - The name of the job to add.
 * @param {QueueJob} job - The job payload to queue.
 * @throws {AppException} When adding to the queue fails or times out.
 */
export async function addToQueue(jobName: string, job: QueueJob) {
  try {
    await timedOutTry<void>(async () => {
      await apiQueue.add(jobName, job);
    });
  } catch {
    Logger.error(ErrorCodes.REDIS_TIMEOUT, {
      message: 'Failed to add job to queue',
    });
    throw new AppException({
      status: 500,
      message: 'Failed process message, try again later',
      code: ErrorCodes.QUEUE_PROCESSING_FAILED,
    });
  }
}

/**
 * Wraps a promise function with a timeout to prevent hanging operations.
 *
 * @param {() => Promise<T>} fn - The async function to execute.
 * @returns {Promise<T>} Resolves with the result of the function if completed
 *   in time.
 * @throws {Error} If the function takes longer than the allowed timeout.
 */
async function timedOutTry<T>(fn: () => Promise<T>): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timed out'));
    }, env.QUEUE_ADD_RETRY_SECONDS * 1000);
  });

  return Promise.race([fn(), timeout]);
}
