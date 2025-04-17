import asyncHandler from 'express-async-handler';
import { a2pSchema } from '@utils/validation/a2p-schema';
import validate from '@utils/validation/validate';
import messagingService from '@services/messaging-service';
import { checkMessageChunkAndEncoding } from '@utils/chunks';
import { randomUUID } from 'node:crypto';

/**
 * A2P (Application-to-Person) message controller.
 *
 * - Validates incoming request body using `a2pSchema`.
 * - Adds the validated message to the main messaging queue.
 * - Responds with a success message, message ID, recipient phone, and detected
 *   provider.
 *
 * @route POST /api/v2/a2p
 * @access Protected (requires auth middleware)
 */

export const a2pController = asyncHandler(async (req, res) => {
  //validate and throw if invalid
  const data = validate(a2pSchema, req.body);

  //check message chunks and encoding
  const { encoding, chunks } = checkMessageChunkAndEncoding({
    message: data.text,
    encoding: data.smsEncoding,
  });

  //add to queue
  await messagingService.addToQueue({
    data,
    serviceType: 'A2P',
    config: req.config!,
  });

  res.json({
    success: true,
    message: 'message queued successfully',
    data: {
      to: data.to,
      smsEncoding: encoding,
      chunks,
      messageId: randomUUID(),
    },
  });
});
