/**
 * Authentication Routes
 */
import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema } from '../models/schemas';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refresh));
router.post('/logout', validate(refreshTokenSchema), asyncHandler(authController.logout));
router.post('/forgot-password', authLimiter, asyncHandler(authController.forgotPassword));
router.post('/reset-password', authLimiter, asyncHandler(authController.resetPassword));
router.get('/verify-email', asyncHandler(authController.verifyEmail));
router.post('/send-phone-otp', authLimiter, asyncHandler(authController.sendPhoneOTP));

// Protected routes
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(authController.changePassword));
router.post('/verify-phone', authenticate, asyncHandler(authController.verifyPhone));

export default router;

