import mime from 'mime-types';

// File validation utilities
export const validateFile = (file) => {
  const errors = [];

  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 104857600; // 100MB
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
  }

  // Check file type
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [];
  const fileType = mime.lookup(file.originalname) || file.mimetype;

  if (allowedTypes.length > 0 && !allowedTypes.includes(fileType)) {
    errors.push(`File type '${fileType}' is not allowed`);
  }

  // Check filename
  if (!file.originalname || file.originalname.length > 255) {
    errors.push('Invalid filename');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate unique filename
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');

  return `${timestamp}-${randomString}-${baseName}.${extension}`;
};

// Sanitize filename for security
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};