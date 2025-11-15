/**
 * File Upload Middleware
 * Validates file types and sizes
 */
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'image/jpg',
];

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for S3 upload
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Error handler for multer
 */
export function handleUploadError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
}

