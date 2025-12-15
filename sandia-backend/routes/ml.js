import express from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/aws.js';
import axios from 'axios';

const router = express.Router();

// ML API server configuration
const ML_API_BASE_URL = process.env.ML_API_URL || 'http://localhost:5001';
const JOBS_BUCKET = process.env.AWS_S3_BUCKET || 'sandia-jobs';

/**
 * POST /api/ml/analyze/:fileId
 * Trigger GNN-based malware analysis for a file
 */
router.post('/analyze/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { s3Key, s3Bucket, fileName } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing file ID',
        message: 'File ID parameter is required'
      });
    }

    console.log(`[ML API] Triggering GNN analysis for file: ${fileId}`);

    // Use provided S3 info or construct from fileId
    const bucket = s3Bucket || JOBS_BUCKET;
    const key = s3Key || `uploads/${fileId}`;

    // Fetch file content from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    console.log(`[ML API] Fetching file from S3://${bucket}/${key}`);

    const s3Response = await s3Client.send(command);
    const scriptContent = await s3Response.Body.transformToString();

    console.log(`[ML API] File fetched successfully (${scriptContent.length} bytes)`);

    // Call ML API
    const mlApiUrl = `${ML_API_BASE_URL}/api/ml/gnn/analyze`;
    console.log(`[ML API] Calling ML API: ${mlApiUrl}`);

    const mlResponse = await axios.post(mlApiUrl, {
      script_content: scriptContent
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log(`[ML API] GNN analysis completed successfully`);

    res.status(200).json({
      success: true,
      message: 'GNN analysis completed',
      data: {
        fileId: fileId,
        fileName: fileName || key,
        analysis: mlResponse.data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ML API] Error during analysis:', error);

    // Handle S3 errors
    if (error.name === 'NoSuchKey') {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The specified file does not exist in S3'
      });
    }

    if (error.name === 'NoSuchBucket') {
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        message: 'S3 bucket not found. Please contact administrator.'
      });
    }

    // Handle ML API errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML API unavailable',
        message: 'ML analysis service is not running. Please start the ML API server on port 5001.'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        error: 'Analysis timeout',
        message: 'ML analysis took too long to complete. Please try again.'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'ML analysis failed',
        message: error.response.data.error || 'An error occurred during GNN analysis',
        details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
      });
    }

    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: 'An unexpected error occurred during ML analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ml/bert/analyze/:fileId
 * Trigger BERT-based semantic malware analysis for a file
 */
router.post('/bert/analyze/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { s3Key, s3Bucket, fileName } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing file ID',
        message: 'File ID parameter is required'
      });
    }

    console.log(`[ML API] Triggering BERT analysis for file: ${fileId}`);

    // Use provided S3 info or construct from fileId
    const bucket = s3Bucket || JOBS_BUCKET;
    const key = s3Key || `uploads/${fileId}`;

    // Fetch file content from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    console.log(`[ML API] Fetching file from S3://${bucket}/${key}`);

    const s3Response = await s3Client.send(command);
    const scriptContent = await s3Response.Body.transformToString();

    console.log(`[ML API] File fetched successfully (${scriptContent.length} bytes)`);

    // Call ML API for BERT analysis
    const mlApiUrl = `${ML_API_BASE_URL}/api/ml/bert/analyze`;
    console.log(`[ML API] Calling BERT API: ${mlApiUrl}`);

    const mlResponse = await axios.post(mlApiUrl, {
      script_content: scriptContent
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log(`[ML API] BERT analysis completed successfully`);

    res.status(200).json({
      success: true,
      message: 'BERT analysis completed',
      data: {
        fileId: fileId,
        fileName: fileName || key,
        analysis: mlResponse.data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ML API] Error during BERT analysis:', error);

    // Handle S3 errors
    if (error.name === 'NoSuchKey') {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The specified file does not exist in S3'
      });
    }

    if (error.name === 'NoSuchBucket') {
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        message: 'S3 bucket not found. Please contact administrator.'
      });
    }

    // Handle ML API errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML API unavailable',
        message: 'ML analysis service is not running. Please start the ML API server on port 5001.'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        error: 'Analysis timeout',
        message: 'BERT analysis took too long to complete. Please try again.'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'BERT analysis failed',
        message: error.response.data.error || 'An error occurred during BERT analysis',
        details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
      });
    }

    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: 'An unexpected error occurred during BERT analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ml/models/info
 * Get information about available ML models
 */
router.get('/models/info', async (req, res) => {
  try {
    const mlApiUrl = `${ML_API_BASE_URL}/api/ml/models/info`;
    const mlResponse = await axios.get(mlApiUrl, { timeout: 5000 });

    res.status(200).json({
      success: true,
      data: mlResponse.data
    });

  } catch (error) {
    console.error('[ML API] Error fetching model info:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML API unavailable',
        message: 'ML service is not running'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch model info',
      message: 'Unable to retrieve ML model information'
    });
  }
});

/**
 * GET /api/ml/health
 * Check ML API health
 */
router.get('/health', async (req, res) => {
  try {
    const mlApiUrl = `${ML_API_BASE_URL}/health`;
    const mlResponse = await axios.get(mlApiUrl, { timeout: 3000 });

    res.status(200).json({
      success: true,
      message: 'ML API is healthy',
      data: mlResponse.data
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'ML API unhealthy',
      message: 'ML service is not responding'
    });
  }
});

export default router;
