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

// Issue 6 Fix: Magic byte signatures for file validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/jpg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

/**
 * Validate file content against magic bytes (Issue 6 Fix)
 */
export function validateFileContent(buffer: Buffer, declaredMimeType: string): boolean {
  const signatures = FILE_SIGNATURES[declaredMimeType];
  if (!signatures) return false;

  return signatures.some(sig => {
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) return false;
    }
    return true;
  });
}

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
  storage: multer.memoryStorage(), // Store in memory for file upload
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

