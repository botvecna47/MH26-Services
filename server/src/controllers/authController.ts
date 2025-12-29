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
import { OTPService } from '../services/otpService';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const authController = {
  /**
   * Register new user - Step 1: Send OTP to email
   * User is NOT created until OTP is verified
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, role, address } = req.body;

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
             email,
          },
        });
      } catch (dbError: any) {
        logger.error('Database error checking existing user:', dbError);
        throw new AppError('Database error. Please try again.', 500);
      }

      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Hash password early before storing in temporary state
      const passwordHash = await hashPassword(password);

      // 1. Generate OTP
      const otp = OTPService.generateOTP();
      logger.debug(`OTP generated for ${email}`);

      // 2. Store registration data with OTP in TTL-managed storage (Issue 5: Prevent memory DoS)
      // This automatically expires in 10 mins (default TTL)
      try {
        await OTPService.storeOTP(email, otp, {
            name,
            email,
            phone,
            passwordHash,
            role: role || 'CUSTOMER',
            address: address || '',
            type: 'REGISTRATION'
        });
        logger.debug(`Registration OTP stored for ${email}`);
      } catch (error: any) {
        logger.error('Failed to store registration OTP:', error);
        throw new AppError('Failed to process registration. Please try again.', 500);
      }

      // Send OTP to email
      await OTPService.sendEmail(email, otp);

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

    const registrationData = await OTPService.getStoredData(email);
    if (!registrationData || registrationData.type !== 'REGISTRATION') {
       throw new AppError('Registration session expired. Please sign up again.', 400);
    }

    const otp = OTPService.generateOTP();
    await OTPService.storeOTP(email, otp, registrationData);
    await OTPService.sendEmail(email, otp);

    res.status(200).json({
      message: 'New verification code sent to your email address.',
      email,
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

    // Verify OTP
    const otpPayload = await OTPService.verifyOTP(email, otp);

    // Retrieve and verify registration data from OTP payload
    if (!otpPayload || otpPayload.type !== 'REGISTRATION') {
       throw new AppError('Invalid or expired registration session. Please sign up again.', 400);
    }

    const registrationData = otpPayload;

    // Check for existing user (double check)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user (ONLY after OTP verification)
    const user = await prisma.user.create({
      data: {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        passwordHash: registrationData.passwordHash,
        role: 'CUSTOMER', // ALWAYS start as CUSTOMER - promote to PROVIDER after admin approval
        address: registrationData.address || '',
        city: 'Nanded', // Hardcoded for local service
        emailVerified: true, // Mark as verified since OTP was verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
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
            id: true,
            businessName: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check provider status - set flags but ALLOW login (UI will redirect as needed)
    let providerStatus: string | null = null;
    let requiresOnboarding = false;

    // Check if user has a provider profile (regardless of current role)
    if (user.provider) {
      providerStatus = user.provider.status;
      // If user is already a PROVIDER role, check for suspension
      // If user is still a CUSTOMER but has a PENDING/REJECTED provider profile, direct to onboarding
      if (user.provider.status === 'PENDING' || user.provider.status === 'REJECTED') {
        requiresOnboarding = true;
      }
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
        walletBalance: user.walletBalance,
        totalSpending: user.totalSpending,
        providerStatus,
        requiresOnboarding,
        provider: user.provider ? {
          id: user.provider.id,
          businessName: user.provider.businessName,
          status: user.provider.status,
        } : undefined,
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
   * Forgot password (OTP based)
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, an OTP has been sent' });
      return;
    }

    // Generate OTP
    const otp = OTPService.generateOTP();
    
    // Store OTP with userId specifically for password reset
    const otpData = {
      userId: user.id,
      email: user.email,
      type: 'PASSWORD_RESET'
    };
    
    // Store with prefix to distinguish from registration if needed, 
    // but OTPService keys by identifier. 
    // To avoid collision with registration, we could use a different identifier like `reset:${email}`
    // But OTPService methods expect just identifier.
    // Let's use `reset:${email}` as identifier for storage/verification to be safe
    // and distinct from registration flow.
    await OTPService.storeOTP(`reset:${email}`, otp, otpData, 600); // 10 mins

    // Send OTP via email using generic email sender in OTPService or custom one
    // OTPService.sendEmail logs and sends.
    await OTPService.sendEmail(email, otp);

    logger.info(`Password reset OTP sent to: ${email}`);
    res.json({ message: 'If the email exists, an OTP has been sent', email });
  },

  /**
   * Reset password (OTP based)
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new AppError('Email, OTP, and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters long', 400);
    }

    // Verify OTP using the prefixed identifier
    const data = await OTPService.verifyOTP(`reset:${email}`, otp);

    if (!data || data.type !== 'PASSWORD_RESET') {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const userId = data.userId;

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    logger.info(`Password reset successful for user: ${userId}`);

    res.json({ message: 'Password reset successfully' });
  },

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;

    logger.info('verifyEmail called', { token: typeof token === 'string' ? token.substring(0, 20) + '...' : token });

    if (!token || typeof token !== 'string') {
      throw new AppError('Verification token is required', 400);
    }

    // Find token record
    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    logger.info('Token record lookup result', { found: !!tokenRecord });

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

    // Issue 8 Fix: Get new email from DB field
    const newEmail = tokenRecord.newEmail;

    // If this is an email CHANGE request (newEmail present in DB)
    if (newEmail) {
        // Check if email is already taken by another user
        const taken = await prisma.user.findUnique({ where: { email: newEmail } });
        if (taken && taken.id !== tokenRecord.userId) {
             await prisma.emailVerificationToken.delete({ where: { token } });
             throw new AppError('Email already taken', 409);
        }

        // Update the user's email
        await prisma.user.update({
            where: { id: tokenRecord.userId },
            data: { 
                email: newEmail,
                emailVerified: true 
            },
        });
        logger.info(`Email CHANGED and verified for user: ${tokenRecord.userId} to ${newEmail}`);
        
        // Delete verification token
        await prisma.emailVerificationToken.delete({ where: { token } });
        
        res.json({ message: 'Email changed successfully' });
        return;
    }

    // Normal verification flow (no email change)
    // Check if email is already verified
    if (user?.emailVerified) {
      // Delete token if already verified
      await prisma.emailVerificationToken.delete({ where: { token } });
      res.json({ message: 'Email is already verified' });
      return;
    }

    // Normal verification (if we ever use it)
    await prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerified: true },
    });
    logger.info(`Email verified for user: ${tokenRecord.userId}`);

    // Delete verification token
    await prisma.emailVerificationToken.delete({ where: { token } });

    res.json({ message: 'Email verified successfully' });
  },

  /**
   * Change password (for authenticated users)
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user!.id;
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
   * Request email change
   */
  async requestEmailChange(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user!.id; // Cast to AuthRequest
    const { newEmail } = req.body;

    if (!newEmail) {
      throw new AppError('New email is required', 400);
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      throw new AppError('Email is already in use', 409);
    }

    // Generate token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token (delete existing if any)
    await prisma.emailVerificationToken.deleteMany({ where: { userId } });
    
    // Issue 8 Fix: Store new email in DB, not URL
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        newEmail, // Stored securely in DB
        expiresAt,
      },
    });

    // Send verification email to the NEW email
    await sendVerificationEmail(newEmail, token);

    res.json({ message: 'Verification link sent to new email address.' });
  },

  /**
   * Check email/phone availability for real-time validation
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    const { email, phone } = req.query;
    const result: { emailAvailable?: boolean; phoneAvailable?: boolean; emailValid?: boolean; phoneValid?: boolean } = {};

    if (email && typeof email === 'string') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      result.emailValid = emailRegex.test(email);
      
      if (result.emailValid) {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        result.emailAvailable = !existingEmail;
      } else {
        result.emailAvailable = false;
      }
    }

    if (phone && typeof phone === 'string') {
      // Validate phone format (10 digits starting with 6-9)
      // Note: Phone numbers can be duplicated, only format is validated
      const phoneRegex = /^[6-9]\d{9}$/;
      result.phoneValid = phoneRegex.test(phone);
      result.phoneAvailable = true; // Always available - duplicates allowed
    }

    res.json(result);
  },
};

