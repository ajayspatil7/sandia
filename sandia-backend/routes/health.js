import express from 'express';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { S3_CONFIG } from '../config/aws.js';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sandia Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// AWS connectivity check
router.get('/aws', async (req, res) => {
  try {
    // Test S3 bucket access
    const command = new HeadObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: 'health-check' // This file doesn't need to exist
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      // 404 is expected if file doesn't exist, but means we can access the bucket
      if (error.name !== 'NotFound') {
        throw error;
      }
    }

    res.status(200).json({
      success: true,
      message: 'AWS S3 connection successful',
      bucket: S3_CONFIG.bucket,
      region: S3_CONFIG.region,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AWS Health Check Error:', error);

    res.status(500).json({
      success: false,
      message: 'AWS S3 connection failed',
      error: error.name,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;