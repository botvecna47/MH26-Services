# Quick CORS Fix Guide

## The Problem
You're getting CORS errors when uploading files because your S3/MinIO bucket doesn't have CORS configured.

## Quick Solutions

### Option 1: Run the Automated Script (Recommended)

```bash
cd server
npm run setup-cors
```

**If you get "Access denied":**
- Check your `.env` file has correct `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Verify the bucket name in `AWS_S3_BUCKET` matches your actual bucket
- For MinIO, ensure `AWS_S3_ENDPOINT` is set (e.g., `http://localhost:9000`)

### Option 2: Manual Setup via MinIO Console (If using MinIO)

1. **Open MinIO Console**
   - Usually at: `http://localhost:9001`
   - Login with your MinIO credentials

2. **Navigate to Bucket**
   - Click on your bucket: `mh26-services-uploads`

3. **Configure CORS**
   - Go to **Access Rules** → **CORS**
   - Click **Add CORS Rule**
   - Paste this configuration:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
    "MaxAgeSeconds": 3000
  }
]
```

4. **Save** and try uploading again!

### Option 3: Manual Setup via AWS Console (If using AWS S3)

1. **Go to AWS S3 Console**
   - https://s3.console.aws.amazon.com/

2. **Select Your Bucket**
   - Click on: `mh26-services-uploads`

3. **Configure CORS**
   - Go to **Permissions** tab
   - Scroll to **Cross-origin resource sharing (CORS)**
   - Click **Edit**
   - Paste this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
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

4. **Save changes**

### Option 4: Using AWS CLI

```bash
# Create cors.json file
cat > cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket mh26-services-uploads \
  --cors-configuration file://cors.json
```

## Verify CORS is Working

After configuring CORS, test it:

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  https://mh26-services-uploads.s3.ap-south-1.amazonaws.com/test
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, PUT, POST, DELETE, HEAD, OPTIONS
Access-Control-Allow-Headers: *
```

## Still Not Working?

1. **Clear browser cache** - CORS settings are cached
2. **Check the exact origin** - Must match exactly (including http/https and port)
3. **Verify bucket name** - Check your `.env` file
4. **Check credentials** - Ensure AWS credentials have proper permissions
5. **Restart your dev server** - Sometimes needed to pick up changes

## Need More Help?

See the detailed guide: `docs/S3_CORS_SETUP.md`

