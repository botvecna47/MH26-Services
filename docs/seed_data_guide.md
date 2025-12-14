# Seed Data & Image Management Guide

This guide explains how to manage the seed data (providers, users, categories) and customize the images used in the application.

## 1. Location of Seed Data

The primary seed file is located at:
`server/prisma/seed.ts`

This file contains the `DESIGN_PROVIDERS` array, which defines all the initial providers injected into the database.

## 2. Modifying Provider Images

To change the images for a specific provider, find their entry in the `DESIGN_PROVIDERS` array in `seed.ts` and update the `gallery` array.

### Example:

```typescript
{
  id: 'p1',
  businessName: 'Shri Sai Tiffin Service',
  // ...
  gallery: [
    // REPLACE THIS URL with your desired image URL
    'https://images.unsplash.com/photo-YOUR-NEW-IMAGE-ID?w=800', 
    'https://another-image-url.com/image.jpg'
  ],
  // ...
}
```

### Supported Image Types:
- **Unsplash URLs**: Optimized for performance (recommended).
- **Direct Image URLs**: Any accessible public URL (e.g., hosted on S3, Cloudinary).
- **Local Images**: If you implement local file serving, you can use paths like `/uploads/my-image.jpg`.

## 3. Adding New Providers

To add a new provider, simply append a new object to the `DESIGN_PROVIDERS` array following the same structure.

```typescript
{
  id: 'p_new_1', // Unique ID
  businessName: 'New Provider Service',
  ownerName: 'John Doe',
  email: 'john@example.com', // Must be unique
  phone: '+91-9999999999', // Must be unique
  primaryCategory: 'tiffin', // Must match an existing category slug
  status: 'APPROVED',
  gallery: ['https://url-to-image.jpg'],
  // ... add other required fields
}
```

## 4. Re-seeding the Database

After modifying `seed.ts`, you must run the seed script to apply changes.

**WARNING: This may reset specific data depending on how `upsert` is implemented. Existing bookings/reviews for these providers might be preserved if IDs match.**

Run the following command in the `server` directory:

```bash
npx prisma db seed
```

Or from the root if configured:
```bash
npm run seed
```

## 5. Troubleshooting "Hardcoded" Data

If you see data in the frontend that does not match your seed data:
1.  **Check Database Connection**: Ensure your `.env` points to the correct database.
2.  **Clear Browser Cache**: Sometimes images are cached.
3.  **Verify Status**: Only `APPROVED` providers are shown in the main list. Ensure your new provider has `status: 'APPROVED'`.
