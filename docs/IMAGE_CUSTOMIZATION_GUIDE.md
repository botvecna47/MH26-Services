# Image Customization Guide

This guide explains how to manually add and use your own images for Providers, Services, and Users in the MH26 Services project.

## 1. Image Locations in Database

The following fields store image data:

| Model | Field | Type | Description | Current Source |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `avatarUrl` | `String` | Profile picture for users/providers | Random Unsplash URL |
| **Provider** | `gallery` | `String[]` | Array of portfolio/work images | Random Unsplash URLs |
| **Service** | `imageUrl` | `String` | Main image for a specific service | Random Unsplash URL |
| **ServiceCategory** | `icon` | `String` | Icon for the category | Emoji (e.g., 🔧) |

## 2. Where to Store Your Images

To use local images, you should place them in the **Frontend Public Directory**. This allows them to be served directly by the web server.

1.  Navigate to: `frontend/public/`
2.  Create a new folder (recommended): `frontend/public/images/seed/`
3.  Add your images there.

**Example Structure:**
```
frontend/public/images/seed/
├── plumbing/
│   ├── pipe-repair.jpg
│   ├── leak-fix.jpg
├── avatars/
│   ├── provider-1.jpg
│   ├── admin.jpg
```

**Access URL:**
If a file is at `frontend/public/images/seed/plumbing/pipe-repair.jpg`, the URL to store in the database is:
`/images/seed/plumbing/pipe-repair.jpg`

## 3. How to Update `seed.ts`

You need to modify `server/prisma/seed.ts` to use your local paths instead of the random URLs.

### A. Updating Service Images
Find the `CATEGORY_IMAGES` object (around line 26). Replace the Unsplash URLs with your local paths.

**Current:**
```typescript
const CATEGORY_IMAGES = {
  Plumbing: [
    'https://images.unsplash.com/...',
    // ...
  ],
```

**Change to:**
```typescript
const CATEGORY_IMAGES = {
  Plumbing: [
    '/images/seed/plumbing/pipe-repair.jpg',
    '/images/seed/plumbing/leak-fix.jpg',
    // ...
  ],
```

### B. Updating Provider Avatars
Find the `USER_AVATARS` array (around line 595).

**Change to:**
```typescript
const USER_AVATARS = [
  '/images/seed/avatars/provider-1.jpg',
  '/images/seed/avatars/provider-2.jpg',
  // ...
];
```

### C. Adding Admin Avatar
The admin currently has no avatar. To add one, find the admin creation block (around line 545) and add `avatarUrl`.

**Change to:**
```typescript
    create: {
      name: 'Admin User',
      email: 'admin@mh26services.com',
      // ...
      avatarUrl: '/images/seed/avatars/admin.jpg', // Add this line
    },
```

### D. Updating Category Icons
Find the `ServiceCategory` creation loop (around line 813).

**Change:**
```typescript
icon: '🔧',
```
**To:**
```typescript
icon: '/images/seed/icons/plumbing.png', // Note: Requires frontend update to display image tags
```

## 4. Applying Changes

After creating your folders, adding images, and updating `seed.ts`:

1.  **Reset Database** (This clears all data and re-seeds):
    ```bash
    cd server
    npm run migrate:reset
    ```
    *Answer 'y' if asked to confirm.*

2.  **Verify**:
    Restart the server and check the frontend to see your new images.

## 5. Specific Provider Customization

If you want specific images for a specific provider (e.g., "Indian Plumbers Ltd."), find their entry in `PROVIDER_DATA` (line 340) and you can add a custom logic in the loop.

**Example modification in loop:**
```typescript
// Inside the provider loop...
let galleryImages;
if (providerData.name === 'Indian Plumbers Ltd.') {
    galleryImages = ['/images/seed/plumbing/specific-work-1.jpg'];
} else {
    galleryImages = getGalleryImages(category); // Default random
}
```
