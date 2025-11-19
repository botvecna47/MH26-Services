# S3/MinIO CORS Configuration Guide

## Problem
When uploading files directly to S3/MinIO from the browser, you may encounter CORS errors:
```
Access to fetch at 'https://...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Solution
Configure CORS on your S3/MinIO bucket to allow uploads from your frontend origin.

## For MinIO (Development)

### Using MinIO Console (Web UI)
1. Open MinIO Console (usually at `http://localhost:9001`)
2. Navigate to your bucket (e.g., `mh26-services-uploads`)
3. Go to **Access Rules** → **CORS**
4. Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
    "MaxAgeSeconds": 3000
  }
]
```

### Using MinIO Client (mc)
```bash
# Set CORS configuration
mc anonymous set-json cors.json mh26-services-uploads
```

Where `cors.json` contains:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Using AWS SDK (Node.js)
Create a script `setup-cors.js`:
```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_S3_ENDPOINT, // MinIO endpoint
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const corsConfiguration = {
  CORSRules: [
    {
      AllowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:5173'
      ],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: [
        'ETag',
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2'
      ],
      MaxAgeSeconds: 3000
    }
  ]
};

s3.putBucketCors({
  Bucket: process.env.AWS_S3_BUCKET || 'mh26-services-uploads',
  CORSConfiguration: corsConfiguration
}, (err, data) => {
  if (err) {
    console.error('Error setting CORS:', err);
  } else {
    console.log('CORS configuration set successfully');
  }
});
```

Run it:
```bash
node setup-cors.js
```

## For AWS S3 (Production)

### Using AWS Console
1. Go to AWS S3 Console
2. Select your bucket
3. Go to **Permissions** → **Cross-origin resource sharing (CORS)**
4. Add the following configuration:

```json
[
  {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### Using AWS CLI
```bash
aws s3api put-bucket-cors \
  --bucket mh26-services-uploads \
  --cors-configuration file://cors.json
```

## Testing CORS Configuration

After configuring CORS, test it:

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  https://your-s3-endpoint/bucket-name/test
```

You should see CORS headers in the response:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, PUT, POST, DELETE, HEAD
Access-Control-Allow-Headers: *
```

## Troubleshooting

1. **CORS still not working?**
   - Clear browser cache
   - Check that the origin in CORS config matches exactly (including protocol and port)
   - Verify the bucket name is correct
   - Check browser console for specific CORS error messages

2. **MinIO specific issues:**
   - Ensure MinIO is running
   - Check MinIO console for bucket permissions
   - Verify MinIO client credentials

3. **Production issues:**
   - Ensure your production frontend URL is in the CORS allowed origins
   - Check AWS S3 bucket policy doesn't conflict with CORS
   - Verify IAM permissions allow CORS configuration

## Alternative: Proxy Upload Through Backend

If CORS configuration is not possible, you can proxy uploads through your backend:

1. Upload file to your backend endpoint
2. Backend uploads to S3/MinIO
3. Backend returns the file URL

This approach is less efficient but avoids CORS issues entirely.

