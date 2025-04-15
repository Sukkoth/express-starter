import { z } from 'zod';
import { MessageServiceType, SmscConfig } from '@/types/queue-job';
import * as queueService from '@services/queue-service';
import { randomUUID as uuidv4 } from 'crypto';
import { AppException } from '@libs/exceptions/app-exception';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import { a2pSchema } from '@utils/validation/a2p-schema';

type Props = {
  /**
   * The data object containing the message details.
   * This comes from the api request
   */
  data: z.infer<typeof a2pSchema>;
  serviceType: MessageServiceType;
  config: SmscConfig;
  /**
   * Any additional metadata to be included with the message.
   * This is optional and can be used for tracking or other purposes.
   */
  meta?: unknown;
};

/**
 * Prepares and queues an SMS message for processing.
 *
 * - Generates a UUID for the message.
 * - Packages all necessary data including routing config and service type.
 * - Forwards the message to the queue service for addition to the BullMQ queue.
 * - Throws an AppException if queueing fails.
 * @throws {AppException} If queueing fails or Redis is unavailable.
 */

async function addToQueue({ data, serviceType, config, meta }: Props) {
  const { body: text, smsType, to, callbackUrl } = data;
  try {
    await queueService.addToQueue(serviceType, {
      to,
      text,
      smsType,
      callbackUrl,
      config,
      id: uuidv4(),
      serviceType: 'A2P',
      createdAt: new Date(),
      meta,
    });
  } catch {
    throw new AppException({
      status: 500,
      message: 'Failed to add message to queue',
      code: ErrorCodes.QUEUE_PROCESSING_FAILED,
    });
  }
}

export default { addToQueue };
