import asyncHandler from 'express-async-handler';
import { parsePhone } from '@libs/parse-phone';
import { a2pSchema } from '@utils/validation/a2p-schema';
import validate from '@utils/validation/validate';
import messagingService from '@services/messaging-service';

/**
 * A2P (Application-to-Person) message controller.
 *
 * - Validates incoming request body using `a2pSchema`.
 * - Adds the validated message to the main messaging queue.
 * - Responds with a success message, message ID, recipient phone, and detected provider.
 *
 * @route POST /api/v2/a2p
 * @access Protected (requires auth middleware)
 *
 * @param {Express.Request} req - The incoming request object.
 * @param {Express.Response} res - The response object used to send the result.
 *
 * @returns {Object} JSON response:
 * - `message`: Status message
 * - `id`: Placeholder message ID
 * - `phone`: Target recipient phone number
 * - `provider`: Detected provider (`ethio_telecom` | `safaricom`)
 */

export const a2pController = asyncHandler(async (req, res) => {
  const data = validate(a2pSchema, req.body);

  await messagingService.addToQueue({
    data,
    serviceType: 'A2P',
    config: req.config!,
  });

  res.json({
    message: 'message queued successfully',
    id: '1234567890',
    phone: data.to,
    provider: parsePhone(data.to).data!.provider,
    callbackUrl: data.callbackUrl,
  });
});
