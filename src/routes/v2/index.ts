import { a2pController } from '@controllers/v2/a2p-controller';
import { otpController } from '@controllers/v2/otp-controller';

import express from 'express';

const router = express();

/**
 * Send message from your application
 *
 * @function POST
 * @url /api/v2/a2p
 */
router.post('/a2p', a2pController);

/**
 * Send OTP to user
 *
 * @function POST
 * @url /api/v2/otp
 */
router.post('/otp', otpController.sendOTP);

/**
 * Verify OTP against given number
 *
 * @function POST
 * @url /api/v2/a2p
 */
router.post('/otp/verify', otpController.verifyOTP);

export default router;
