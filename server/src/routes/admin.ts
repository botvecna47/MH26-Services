/**
 * Admin Routes
 */
import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require admin role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Analytics
router.get('/analytics', asyncHandler(adminController.getAnalytics));

// Providers
router.get('/providers/pending', asyncHandler(adminController.getPendingProviders));
router.get('/providers', asyncHandler(adminController.getAllProviders));
router.post('/providers/create', asyncHandler(adminController.createProvider)); // New Route
router.post('/providers/:id/approve', asyncHandler(adminController.approveProvider));
router.post('/providers/:id/reject', asyncHandler(adminController.rejectProvider));
router.patch('/providers/:id/suspend', asyncHandler(adminController.suspendProvider));
router.patch('/providers/:id/unsuspend', asyncHandler(adminController.unsuspendProvider));

// Users
router.get('/users', asyncHandler(adminController.listUsers));
router.get('/users/:id', asyncHandler(adminController.getUser));
router.patch('/users/:id/ban', asyncHandler(adminController.banUser));
router.patch('/users/:id/unban', asyncHandler(adminController.unbanUser));

// Appeals
router.get('/appeals', asyncHandler(adminController.getAppeals));

// Reports (already handled in reports route, but keeping for consistency)
router.get('/reports', asyncHandler(adminController.getReports));

// Bookings
router.get('/bookings', asyncHandler(adminController.getAllBookings));

// Settings
router.patch('/settings', asyncHandler(adminController.updateSettings));

// Export
router.get('/export/providers', asyncHandler(adminController.exportProviders));

// Audit Logs
router.get('/audit-logs', asyncHandler(adminController.getAuditLogs));

export default router;

