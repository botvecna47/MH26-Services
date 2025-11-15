/**
 * AWS S3 Configuration
 * For file uploads and document storage
 */
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
  endpoint: process.env.AWS_S3_ENDPOINT || undefined,
  s3ForcePathStyle: process.env.AWS_S3_ENDPOINT ? true : false,
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'mh26-services-uploads';

/**
 * Generate presigned URL for file upload
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  return s3.getSignedUrlPromise('putObject', {
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    Expires: expiresIn,
    ACL: 'private',
  });
}

/**
 * Generate presigned URL for file download
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  return s3.getSignedUrlPromise('getObject', {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: expiresIn,
  });
}

/**
 * Delete file from S3
 */
export async function deleteS3File(key: string): Promise<void> {
  await s3.deleteObject({
    Bucket: S3_BUCKET,
    Key: key,
  }).promise();
}

export default s3;

