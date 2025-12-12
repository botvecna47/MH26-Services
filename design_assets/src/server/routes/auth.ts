// Authentication routes for Express.js
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  rateLimitByUser 
} from '../middleware/auth';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for auth routes
const authRateLimit = rateLimitByUser(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Register route
router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      userType,
      businessName,
      serviceCategories,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !userType) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }

    if (!['CUSTOMER', 'PROVIDER'].includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type',
      });
    }

    // Provider-specific validation
    if (userType === 'PROVIDER') {
      if (!businessName || !serviceCategories || serviceCategories.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Business name and service categories are required for providers',
        });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email or phone already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        userType: userType,
        businessName: userType === 'PROVIDER' ? businessName?.trim() : undefined,
        serviceCategories: userType === 'PROVIDER' ? serviceCategories : undefined,
        isApproved: userType === 'PROVIDER' ? false : undefined, // Providers need approval
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        isVerified: true,
        isActive: true,
        businessName: true,
        serviceCategories: true,
        isApproved: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Store refresh token in database (optional, for better security)
    await prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: newUser.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60, // 15 minutes
        },
      },
      message: userType === 'PROVIDER' 
        ? 'Registration successful! Your account will be reviewed and approved within 2-3 business days.'
        : 'Registration successful! Welcome to MH26 Services.',
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration',
    });
  }
});

// Login route
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email, password, userType } = req.body;

    // Validation
    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and user type are required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        userType: userType,
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        isVerified: true,
        isActive: true,
        businessName: true,
        serviceCategories: true,
        isApproved: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if provider is approved
    if (user.userType === 'PROVIDER' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        error: 'Your provider account is pending approval. Please wait for admin review.',
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
        },
      },
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login',
    });
  }
});

// Refresh token route
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }

    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: { sessionToken: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
            isVerified: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid',
      });
    }

    if (!session.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated',
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(session.user);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: refreshToken, // Keep same refresh token
        expiresIn: 15 * 60,
      },
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during token refresh',
    });
  }
});

// Logout route
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove session from database
      await prisma.session.deleteMany({
        where: { sessionToken: refreshToken },
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during logout',
    });
  }
});

// Forgot password route
router.post('/forgot-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email is required',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists, password reset instructions have been sent.',
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: resetToken,
        expires: resetExpires,
      },
    });

    // In production, send email here
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Reset password route
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required',
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      });
    }

    // Find valid reset token
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and remove reset token
    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
      // Invalidate all existing sessions for security
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Verify email route (for email verification feature)
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }

    // Update user verification status
    await Promise.all([
      prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { isVerified: true },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;