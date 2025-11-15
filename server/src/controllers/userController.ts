/**
 * User Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import logger from '../config/logger';
import { generatePresignedUploadUrl, S3_BUCKET } from '../config/s3';

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
      const { name, phone, avatarUrl } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          avatarUrl,
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
   * Upload profile picture (get presigned URL)
   */
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { filename, contentType } = req.body;

      if (!filename || !contentType) {
        res.status(400).json({ error: 'Filename and content type are required' });
        return;
      }

      // Validate image type
      if (!contentType.startsWith('image/')) {
        res.status(400).json({ error: 'Only image files are allowed' });
        return;
      }

      const key = `users/${userId}/avatar/${Date.now()}-${filename}`;
      const presignedUrl = await generatePresignedUploadUrl(key, contentType);

      // Generate public URL (or presigned download URL)
      const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;

      res.json({
        presignedUrl,
        key,
        url: publicUrl,
      });
    } catch (error) {
      logger.error('Upload avatar error:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
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

