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
import { generateOTP, storeOTP, verifyOTP, sendOTP } from '../utils/otp';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const authController = {
  /**
   * Register new user
   */
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, phone, password, role, otp } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 409);
    }

    // If OTP is provided, verify it before creating user
    if (otp && phone) {
      const isValidOTP = await verifyOTP(phone, otp);
      if (!isValidOTP) {
        throw new AppError('Invalid or expired OTP', 400);
      }
    } else if (phone) {
      // Generate and send OTP
      const otpCode = generateOTP();
      await storeOTP(phone, otpCode);
      await sendOTP(phone, otpCode);

      res.status(200).json({
        message: 'OTP sent to your phone number',
        requiresOTP: true,
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: role || 'CUSTOMER',
        phoneVerified: !!otp, // Mark as verified if OTP was provided
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

    // Generate and store verification token
    const verificationToken = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    try {
      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt,
        },
      });

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      user,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m',
      },
    });
  },

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
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
   * Send OTP for phone verification
   */
  async sendPhoneOTP(req: Request, res: Response): Promise<void> {
    const { phone } = req.body;

    if (!phone) {
      throw new AppError('Phone number is required', 400);
    }

    // Generate and send OTP
    const otp = generateOTP();
    await storeOTP(phone, otp);
    await sendOTP(phone, otp);

    res.json({ message: 'OTP sent to your phone number' });
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

  /**
   * Verify phone (OTP)
   */
  async verifyPhone(req: AuthRequest, res: Response): Promise<void> {
    const { phone, otp } = req.body;
    const userId = req.user!.id;

    if (!phone || !otp) {
      throw new AppError('Phone number and OTP are required', 400);
    }

    const isValid = await verifyOTP(phone, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true },
    });

    res.json({ message: 'Phone verified successfully' });
  },
};

