import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3 Configuration
export const S3_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
  uploadPath: 'uploads/',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB default
};

export default s3Client;