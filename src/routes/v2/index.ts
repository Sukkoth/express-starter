import { a2pController } from '@controllers/v2/a2p-controller';
import { otpController } from '@controllers/v2/otp-controller';

import express from 'express';

const router = express();

/**
 * @url /api/v2/a2p
 * @method POST
 * @description Send message from your application
 */
router.post('/a2p', a2pController);

/**
 * @url /api/v2/otp/register
 * @method POST
 * @description Send OTP to user
 */
router.post('/otp/register', otpController.sendOTP);

/**
 * @url /api/v2/a2p
 * @method POST
 * @description Verify OTP against given number
 */
router.post('/otp/verify', otpController.verifyOTP);

export default router;
