/**
 * Authentication Controller
 */
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { hashPassword, verifyPassword } from '../utils/security';
import { generateAccessToken, generateRefreshToken, revokeRefreshToken, isRefreshTokenValid } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { generateSecureToken } from '../utils/security';
import { generateOTP, storeEmailOTP, verifyEmailOTP, sendEmailOTP, storeOTP, verifyOTP, sendOTP } from '../utils/otp';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const authController = {
  /**
   * Register new user - Step 1: Send OTP to email
   * User is NOT created until OTP is verified
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, role } = req.body;

      logger.debug('Registration attempt:', { email, phone: phone?.substring(0, 3) + '***' });

      // Validate required fields
      if (!name || !email || !phone || !password) {
        throw new AppError('Name, email, phone, and password are required', 400);
      }

      // Validate phone format (should be validated by schema, but double-check)
      if (!/^[6-9]\d{9}$/.test(phone) || phone.length !== 10) {
        throw new AppError('Phone number must be exactly 10 digits starting with 6-9', 400);
      }

      // Check if user already exists
      let existingUser;
      try {
        existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { phone }],
          },
        });
      } catch (dbError: any) {
        logger.error('Database error checking existing user:', dbError);
        throw new AppError('Database error. Please try again.', 500);
      }

      if (existingUser) {
        throw new AppError('User with this email or phone already exists', 409);
      }

      // Generate OTP
      const otp = generateOTP();
      logger.debug(`OTP generated for ${email}`);

      // Store registration data temporarily (Redis or in-memory)
      // This data will be used to create the user after OTP verification
      const registrationData = {
        name,
        email,
        phone,
        password, // Will be hashed when creating user
        role: role || 'CUSTOMER',
      };

      try {
        await storeEmailOTP(email, otp, registrationData);
        logger.debug(`OTP stored for ${email}`);
      } catch (error: any) {
        logger.error('Failed to store email OTP:', {
          error: error.message,
          stack: error.stack,
          email,
        });
        throw new AppError('Failed to process registration. Please try again.', 500);
      }

      // Send OTP to email
      try {
        await sendEmailOTP(email, otp);
        logger.info(`Registration OTP sent to: ${email}`);
      } catch (error: any) {
        logger.error('Failed to send registration OTP email:', {
          email,
          error: error.message,
          code: error.code,
          stack: error.stack,
        });
        
        // Check if SMTP is configured
        const smtpConfigured = 
          process.env.SMTP_HOST && 
          process.env.SMTP_USER && 
          process.env.SMTP_PASS;
        
        if (!smtpConfigured) {
          // If SMTP not configured, log OTP to console and continue
          logger.warn('SMTP not configured. OTP logged to console for testing.');
          console.log(`\n📧 REGISTRATION OTP for ${email}: ${otp}\n`);
          console.log('⚠️  Configure SMTP settings in .env to send actual emails.');
        } else {
          // If SMTP is configured but sending failed, log OTP and continue (don't block registration)
          logger.error('SMTP configured but email sending failed. OTP logged to console.');
          console.log(`\n❌ EMAIL SEND FAILED - REGISTRATION OTP for ${email}: ${otp}\n`);
          console.log('Error:', error.message);
          // Don't throw error - allow registration to continue, user can check console for OTP
        }
      }

      res.status(200).json({
        message: 'OTP sent to your email address. Please verify to complete registration.',
        requiresOTP: true,
        email: email, // Return email for frontend to use in verification
      });
    } catch (error: any) {
      // Re-throw AppError as-is
      if (error instanceof AppError) {
        throw error;
      }
      // Log unexpected errors with full details
      logger.error('Unexpected error in register:', {
        error: error.message,
        stack: error.stack,
        name: error.name,
        body: req.body ? { ...req.body, password: '***', phone: req.body.phone?.substring(0, 3) + '***' } : null,
      });
      throw new AppError('Registration failed. Please try again.', 500);
    }
  },

  /**
   * Resend registration OTP
   */
  async resendRegistrationOTP(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Check if there's pending registration data and get it
    const key = `email_otp:${email}`;
    let registrationData: any = null;

    try {
      // Try Redis first
      const { getRedisClient } = await import('../config/redis');
      const redis = getRedisClient();
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        registrationData = parsed.registrationData;
      }
    } catch (error) {
      // Fallback to in-memory - need to access the store directly
      const { inMemoryOTPStore } = await import('../utils/otp');
      const stored = inMemoryOTPStore.get(key);
      if (stored) {
        registrationData = stored.registrationData;
      }
    }

    if (!registrationData) {
      throw new AppError('No pending registration found. Please start registration again.', 404);
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update OTP in storage (reuse storeEmailOTP logic)
    await storeEmailOTP(email, otp, registrationData);

    // Send new OTP
    try {
      await sendEmailOTP(email, otp);
      logger.info(`Registration OTP resent to: ${email}`);
    } catch (error: any) {
      logger.error('Failed to resend registration OTP email:', error);
      // Log OTP to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📧 RESEND REGISTRATION OTP for ${email}: ${otp}\n`);
      }
    }

    res.json({
      message: 'OTP resent to your email address',
      email: email,
    });
  },

  /**
   * Verify email OTP and complete registration
   * User is created ONLY after OTP is verified
   */
  async verifyRegistrationOTP(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError('Email and OTP are required', 400);
    }

    // Verify OTP and get registration data
    const registrationData = await verifyEmailOTP(email, otp);

    if (!registrationData) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Check if user was created in the meantime (race condition protection)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: registrationData.email }, { phone: registrationData.phone }],
      },
    });

    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(registrationData.password);

    // Create user (ONLY after OTP verification)
    const user = await prisma.user.create({
      data: {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        passwordHash,
        role: registrationData.role,
        emailVerified: true, // Mark as verified since OTP was verified
        phoneVerified: false, // Phone verification can be done separately
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    logger.info(`User registered successfully: ${user.id} (${user.email})`);

    res.status(201).json({
      user,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m',
      },
      message: 'Registration successful!',
    });
  },

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Find user with provider status
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        provider: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if provider is suspended
    if (user.role === 'PROVIDER' && user.provider?.status === 'SUSPENDED') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m',
      },
    });
  },

  /**
   * Refresh access token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    // Verify refresh token is valid
    const isValid = await isRefreshTokenValid(refreshToken);
    if (!isValid) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Get token from database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new AppError('Refresh token not found', 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: tokenRecord.userId,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    });

    res.json({
      accessToken,
      expiresIn: '15m',
    });
  },

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  },

  /**
   * Forgot password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a password reset link has been sent' });
      return;
    }

    // Generate and store reset token
    const resetToken = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    try {
      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      // Don't reveal if email sending failed
    }

    res.json({ message: 'If the email exists, a password reset link has been sent' });
  },

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;

    // Find token record
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      throw new AppError('Invalid reset token', 400);
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      throw new AppError('Reset token has expired', 400);
    }

    // Check if token has been used
    if (tokenRecord.used) {
      throw new AppError('Reset token has already been used', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId },
      data: { revokedAt: new Date() },
    });

    logger.info(`Password reset successful for user: ${tokenRecord.userId}`);

    res.json({ message: 'Password reset successfully' });
  },

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new AppError('Verification token is required', 400);
    }

    // Find token record
    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      throw new AppError('Invalid verification token', 400);
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { token } });
      throw new AppError('Verification token has expired', 400);
    }

    // Check if email is already verified
    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      select: { emailVerified: true },
    });

    if (user?.emailVerified) {
      // Delete token if already verified
      await prisma.emailVerificationToken.delete({ where: { token } });
      res.json({ message: 'Email is already verified' });
      return;
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: true },
    });

    // Delete verification token
    await prisma.emailVerificationToken.delete({ where: { token } });

    logger.info(`Email verified for user: ${tokenRecord.userId}`);

    res.json({ message: 'Email verified successfully' });
  },

  /**
   * Change password (for authenticated users)
   */
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters long', 400);
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    logger.info(`Password changed for user: ${userId}`);

    res.json({ message: 'Password changed successfully' });
  },
};

