/**
 * User Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import logger from '../config/logger';

export const userController = {
  /**
   * Get current user
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
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
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      logger.error('Get me error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  /**
   * Update current user profile
   */
  async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, phone } = req.body;

      // Validate phone number if provided
      if (phone !== undefined) {
        // Check phone format (10 digits starting with 6-9)
        if (!/^[6-9]\d{9}$/.test(phone) || phone.length !== 10) {
          res.status(400).json({ error: 'Phone number must be 10 digits starting with 6-9' });
          return;
        }

        // Check if phone number is already taken by another user
        const existingUser = await prisma.user.findFirst({
          where: {
            phone: phone,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          res.status(409).json({ error: 'Phone number is already registered to another account' });
          return;
        }
      }

      const { avatarUrl } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Update me error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  /**
   * Upload profile picture (direct upload through backend)
   * This avoids CORS issues by proxying through the backend
   */
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Validate image type
      if (!file.mimetype.startsWith('image/')) {
        res.status(400).json({ error: 'Only image files are allowed' });
        return;
      }

      const key = `users/${userId}/avatar/${Date.now()}-${file.originalname}`;

      // Upload to S3 (if configured) or use local storage
      let url: string;
      
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET) {
        // Upload to S3/MinIO
        try {
          const s3Module = await import('../config/s3');
          const s3 = s3Module.default;
          const bucketName = s3Module.S3_BUCKET;
          
          await s3.putObject({
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private',
          }).promise();

          // Generate URL for access
          if (process.env.AWS_S3_ENDPOINT) {
            // MinIO or custom endpoint
            url = `${process.env.AWS_S3_ENDPOINT}/${bucketName}/${key}`;
          } else {
            // AWS S3
            url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
          }
        } catch (s3Error) {
          logger.warn('S3 upload failed, falling back to local storage:', s3Error);
          // Fall through to local storage
          const fs = await import('fs');
          const path = await import('path');
          const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
          
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const fileName = `${userId}-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, file.buffer);
          url = `/uploads/avatars/${fileName}`;
        }
      } else {
        // No S3 configured - use local storage (FREE!)
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
        
        // Ensure directory exists
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, `${userId}-${Date.now()}-${file.originalname}`);
        fs.writeFileSync(filePath, file.buffer);
        
        // Return URL relative to backend (will be served by static middleware)
        url = `/uploads/avatars/${path.basename(filePath)}`;
      }

      // Update user profile with new avatar URL
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: url },
      });

      res.json({
        url,
        key,
        message: 'Avatar uploaded successfully',
      });
    } catch (error) {
      logger.error('Upload avatar error:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  },

  /**
   * Get user by ID (public info only)
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          provider: {
            select: {
              id: true,
              businessName: true,
              averageRating: true,
              totalRatings: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },
};

