import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import { ErrorCodes } from '@libs/exceptions/error-codes';
import Logger from '@libs/logger';

const connection = new IORedis({ maxRetriesPerRequest: null });

connection.on('error', () => {
  Logger.error(ErrorCodes.REDIS_COULD_NOT_CONNECT, {
    message: 'Redis connection failed',
  });
});

/**
 * Main BullMQ queue for handling A2P and OTP messages across all SMSCs.
 *
 * - Handles messages submitted from the API (OTP, A2P).
 * - On this project, it serves only as prouder
 * - Worker is set up on SMS-SERVICE
 * - Configured to skip waiting for Redis connection readiness to avoid blocking
 *   behavior.
 *
 * Queue name: `api-queue`
 */
export const apiQueue = new Queue('api-queue', {
  connection,
  skipWaitingForReady: true,
});
