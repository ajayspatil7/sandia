import multer from 'multer';
import { validateFile } from '../utils/fileValidation.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const validation = validateFile(file);

  if (validation.isValid) {
    cb(null, true);
  } else {
    cb(new Error(validation.errors.join(', ')), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
    files: 1, // Only allow 1 file at a time
  },
  fileFilter: fileFilter,
});

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File size too large',
          message: `Maximum file size is ${process.env.MAX_FILE_SIZE / 1024 / 1024}MB`
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          message: 'Only one file is allowed'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          message: 'File field name must be "file"'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          message: error.message
        });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      error: 'File validation error',
      message: error.message
    });
  }

  next(error);
};

export default upload;