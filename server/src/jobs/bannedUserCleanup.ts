/**
 * Banned User Cleanup Job
 * Permanently deletes users who have been banned for 30+ days
 * This should be run periodically (e.g., daily via cron or scheduled task)
 */
import { prisma } from '../config/db';
import logger from '../config/logger';

const BAN_DURATION_DAYS = 30;

export async function cleanupBannedUsers(): Promise<{ deleted: number; userIds: string[] }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - BAN_DURATION_DAYS);

  logger.info(`[Cleanup] Checking for users banned before ${cutoffDate.toISOString()}`);

  // Find users banned more than 30 days ago
  const expiredBannedUsers = await prisma.user.findMany({
    where: {
      isBanned: true,
      bannedAt: {
        lte: cutoffDate,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      bannedAt: true,
    },
  });

  if (expiredBannedUsers.length === 0) {
    logger.info('[Cleanup] No expired banned users found');
    return { deleted: 0, userIds: [] };
  }

  logger.warn(`[Cleanup] Found ${expiredBannedUsers.length} users to delete:`, 
    expiredBannedUsers.map(u => ({ id: u.id, email: u.email, bannedAt: u.bannedAt }))
  );

  const deletedUserIds: string[] = [];

  // Delete each user (cascade will handle related records)
  for (const user of expiredBannedUsers) {
    try {
      // Log before deletion for audit
      await prisma.auditLog.create({
        data: {
          userId: null, // System action
          action: 'PERMANENT_DELETE_BANNED_USER',
          tableName: 'User',
          recordId: user.id,
          oldData: {
            email: user.email,
            name: user.name,
            bannedAt: user.bannedAt,
            deletedAt: new Date(),
            reason: '30-day ban period expired without appeal approval',
          },
        },
      });

      // Delete the user (cascades to related records)
      await prisma.user.delete({
        where: { id: user.id },
      });

      deletedUserIds.push(user.id);
      logger.info(`[Cleanup] Deleted user ${user.id} (${user.email})`);
    } catch (error) {
      logger.error(`[Cleanup] Failed to delete user ${user.id}:`, error);
    }
  }

  logger.info(`[Cleanup] Completed. Deleted ${deletedUserIds.length} users.`);
  return { deleted: deletedUserIds.length, userIds: deletedUserIds };
}

// Run cleanup on server startup (optional, for development)
// In production, this should be a scheduled cron job
export function scheduleCleanupJob(intervalHours: number = 24): NodeJS.Timeout {
  logger.info(`[Cleanup] Scheduling banned user cleanup every ${intervalHours} hours`);
  
  // Run immediately on start
  cleanupBannedUsers().catch(err => logger.error('[Cleanup] Initial run failed:', err));
  
  // Then run periodically
  return setInterval(() => {
    cleanupBannedUsers().catch(err => logger.error('[Cleanup] Scheduled run failed:', err));
  }, intervalHours * 60 * 60 * 1000);
}
