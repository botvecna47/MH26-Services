/**
 * Database Backup Script
 * Creates a JSON backup of all data from the database
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backup() {
  console.log('📦 Starting database backup...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
  
  try {
    // Fetch all data from each table
    const [
      users,
      providers,
      categories,
      services,
      bookings,
      reviews,
      notifications,
      messages,
      appeals,
      reports,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.provider.findMany(),
      prisma.category.findMany(),
      prisma.service.findMany(),
      prisma.booking.findMany(),
      prisma.review.findMany(),
      prisma.notification.findMany(),
      prisma.message.findMany(),
      prisma.appeal.findMany(),
      prisma.report.findMany(),
    ]);
    
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        providers,
        categories,
        services,
        bookings,
        reviews,
        notifications,
        messages,
        appeals,
        reports,
      },
      counts: {
        users: users.length,
        providers: providers.length,
        categories: categories.length,
        services: services.length,
        bookings: bookings.length,
        reviews: reviews.length,
        notifications: notifications.length,
        messages: messages.length,
        appeals: appeals.length,
        reports: reports.length,
      },
    };
    
    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log('✅ Backup completed successfully!');
    console.log(`📄 File: ${backupFile}`);
    console.log('\n📊 Summary:');
    Object.entries(backup.counts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
