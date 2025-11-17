/**
 * S3/MinIO CORS Configuration Script
 * Automatically configures CORS on your S3/MinIO bucket
 * 
 * Usage:
 *   npm run setup-cors
 *   or
 *   ts-node scripts/setup-s3-cors.ts
 */

import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
  endpoint: process.env.AWS_S3_ENDPOINT || undefined,
  s3ForcePathStyle: process.env.AWS_S3_ENDPOINT ? true : false,
  signatureVersion: 'v4',
});

const BUCKET = process.env.AWS_S3_BUCKET || 'mh26-services-uploads';
const FRONTEND_URL = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';

// Parse multiple origins if comma-separated
const allowedOrigins = FRONTEND_URL.split(',').map(o => o.trim());

// Add common development origins
const developmentOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

// Combine and deduplicate origins
const allOrigins = [...new Set([...allowedOrigins, ...developmentOrigins])];

const corsConfiguration: AWS.S3.CORSConfiguration = {
  CORSRules: [
    {
      AllowedOrigins: allOrigins,
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      AllowedHeaders: ['*'],
      ExposeHeaders: [
        'ETag',
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2',
        'Content-Length',
        'Content-Type',
      ],
      MaxAgeSeconds: 3000,
    },
  ],
};

async function setupCORS() {
  try {
    console.log('🚀 Setting up CORS configuration for S3/MinIO bucket...');
    console.log(`📦 Bucket: ${BUCKET}`);
    console.log(`🌐 Allowed Origins: ${allOrigins.join(', ')}`);
    console.log('');

    // Check if bucket exists
    try {
      await s3.headBucket({ Bucket: BUCKET }).promise();
      console.log('✅ Bucket exists');
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.error(`❌ Bucket "${BUCKET}" does not exist. Please create it first.`);
        console.error('');
        console.error('💡 To create the bucket:');
        if (process.env.AWS_S3_ENDPOINT) {
          console.error('   Using MinIO Console: http://localhost:9001');
        } else {
          console.error('   Using AWS Console: https://s3.console.aws.amazon.com/');
        }
        process.exit(1);
      } else if (error.statusCode === 403) {
        console.error(`❌ Access denied to bucket "${BUCKET}".`);
        console.error('');
        console.error('💡 Troubleshooting:');
        console.error('   1. Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
        console.error('   2. Verify the bucket name is correct');
        if (process.env.AWS_S3_ENDPOINT) {
          console.error('   3. For MinIO, ensure the endpoint is correct:', process.env.AWS_S3_ENDPOINT);
        }
        console.error('   4. Ensure your credentials have s3:PutBucketCors permission');
        console.error('');
        console.error('📖 See docs/S3_CORS_SETUP.md for manual setup instructions');
        process.exit(1);
      } else {
        throw error;
      }
    }

    // Set CORS configuration
    await s3.putBucketCors({
      Bucket: BUCKET,
      CORSConfiguration: corsConfiguration,
    }).promise();

    console.log('✅ CORS configuration set successfully!');
    console.log('');
    console.log('📋 Configuration applied:');
    console.log(JSON.stringify(corsConfiguration, null, 2));
    console.log('');
    console.log('✨ You can now upload files from your frontend!');
  } catch (error: any) {
    console.error('❌ Error setting CORS configuration:');
    console.error(error.message);
    
    if (error.code === 'AccessDenied') {
      console.error('');
      console.error('💡 Tip: Make sure your AWS credentials have the following permissions:');
      console.error('   - s3:PutBucketCors');
      console.error('   - s3:GetBucketCors');
    }
    
    process.exit(1);
  }
}

// Run the script
setupCORS();

