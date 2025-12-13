import express from 'express';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import s3Client from '../config/aws.js';

const router = express.Router();

// S3 bucket for analysis results
const RESULTS_BUCKET = process.env.AWS_S3_RESULTS_BUCKET || 'sandia-analysis-results';

// Lambda client configuration
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Lambda function name for static analysis
const LAMBDA_FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'sandia-static-analysis';

// Trigger Lambda analysis for a file
router.post('/trigger/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { s3Key, s3Bucket, fileName } = req.body;

    if (!fileId || !s3Key || !s3Bucket) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'fileId, s3Key, and s3Bucket are required'
      });
    }

    console.log(`Triggering Lambda analysis for file: ${fileId}, S3: ${s3Bucket}/${s3Key}`);

    // Prepare Lambda payload
    const payload = {
      fileId: fileId,
      s3Bucket: s3Bucket,
      s3Key: s3Key,
      fileName: fileName || s3Key,
      analysisType: 'static',
      resultsBucket: RESULTS_BUCKET,
      timestamp: new Date().toISOString()
    };

    // Invoke Lambda function
    const command = new InvokeCommand({
      FunctionName: LAMBDA_FUNCTION_NAME,
      InvocationType: 'Event', // Asynchronous invocation
      Payload: JSON.stringify(payload)
    });

    const lambdaResponse = await lambdaClient.send(command);

    console.log(`Lambda invoked successfully. Status: ${lambdaResponse.StatusCode}`);

    res.status(202).json({
      success: true,
      message: 'Analysis triggered successfully',
      data: {
        fileId: fileId,
        status: 'processing',
        lambdaStatus: lambdaResponse.StatusCode,
        message: 'Static analysis has been initiated. Results will be available shortly.',
        estimatedTime: '30-60 seconds'
      }
    });

  } catch (error) {
    console.error('Error triggering Lambda analysis:', error);

    if (error.name === 'ResourceNotFoundException') {
      return res.status(500).json({
        success: false,
        error: 'Lambda function not found',
        message: `The Lambda function '${LAMBDA_FUNCTION_NAME}' does not exist. Please check your configuration.`
      });
    }

    if (error.name === 'InvalidRequestContentException') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'The Lambda function payload is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to trigger analysis',
      message: 'An error occurred while triggering the analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get analysis results for a specific file ID
router.get('/results/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing file ID',
        message: 'File ID parameter is required'
      });
    }

    // Fetch results from S3 results bucket
    const command = new GetObjectCommand({
      Bucket: RESULTS_BUCKET,
      Key: `results/${fileId}.json`
    });

    console.log(`Fetching analysis results for file: ${fileId} from S3://${RESULTS_BUCKET}/results/${fileId}.json`);

    const response = await s3Client.send(command);
    const resultsJson = await response.Body.transformToString();
    const results = JSON.parse(resultsJson);

    res.status(200).json({
      success: true,
      message: 'Analysis results retrieved successfully',
      data: results
    });

  } catch (error) {
    console.error('Error fetching analysis results:', error);

    if (error.name === 'NoSuchKey') {
      return res.status(404).json({
        success: false,
        error: 'Results not found',
        message: 'Analysis results not found. Analysis may still be in progress or failed.'
      });
    }

    if (error.name === 'NoSuchBucket') {
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        message: 'Results storage bucket not found. Please contact administrator.'
      });
    }

    if (error.name === 'CredentialsError' || error.name === 'UnauthorizedOperation') {
      return res.status(500).json({
        success: false,
        error: 'Access denied',
        message: 'Unable to access analysis results storage'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch results',
      message: 'An error occurred while retrieving analysis results',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get analysis status for a file
router.get('/status/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing file ID',
        message: 'File ID parameter is required'
      });
    }

    // Check if results file exists in S3
    const command = new GetObjectCommand({
      Bucket: RESULTS_BUCKET,
      Key: `results/${fileId}.json`
    });

    try {
      const response = await s3Client.send(command);

      res.status(200).json({
        success: true,
        data: {
          fileId: fileId,
          status: 'completed',
          message: 'Analysis completed and results are available',
          completedAt: response.LastModified,
          resultSize: response.ContentLength
        }
      });
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        res.status(200).json({
          success: true,
          data: {
            fileId: fileId,
            status: 'pending',
            message: 'Analysis in progress or not started'
          }
        });
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Error checking analysis status:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: 'Unable to check analysis status'
    });
  }
});

// List all available analysis results
router.get('/results', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: RESULTS_BUCKET,
      MaxKeys: 100
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          results: [],
          count: 0,
          message: 'No analysis results found'
        }
      });
    }

    const results = response.Contents.map(obj => ({
      fileId: obj.Key.replace('.json', ''),
      lastModified: obj.LastModified,
      size: obj.Size,
      s3Key: obj.Key
    }));

    res.status(200).json({
      success: true,
      data: {
        results: results,
        count: results.length,
        bucket: RESULTS_BUCKET
      }
    });

  } catch (error) {
    console.error('Error listing analysis results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list results',
      message: 'Unable to retrieve analysis results list'
    });
  }
});

export default router;