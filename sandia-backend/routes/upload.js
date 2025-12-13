import express from 'express';
import { PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import s3Client, { S3_CONFIG } from '../config/aws.js';
import upload, { handleMulterError } from '../middleware/upload.js';
import { generateUniqueFilename, sanitizeFilename } from '../utils/fileValidation.js';

const router = express.Router();

// File upload endpoint
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    const file = req.file;
    const jobId = uuidv4();
    const sanitizedName = sanitizeFilename(file.originalname);
    const uniqueFilename = generateUniqueFilename(sanitizedName);
    const s3Key = `${S3_CONFIG.uploadPath}${jobId}/${uniqueFilename}`;

    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: S3_CONFIG.bucket,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        jobId: jobId,
        uploadTimestamp: new Date().toISOString(),
        fileSize: file.size.toString()
      }
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        jobId: jobId,
        filename: uniqueFilename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        s3Key: s3Key,
        uploadTimestamp: new Date().toISOString(),
        etag: result.ETag
      }
    });

  } catch (error) {
    console.error('S3 Upload Error:', error);

    // Handle specific AWS errors
    if (error.name === 'CredentialsError') {
      return res.status(500).json({
        success: false,
        error: 'AWS credentials error',
        message: 'Unable to authenticate with AWS services'
      });
    }

    if (error.name === 'NetworkingError') {
      return res.status(500).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to AWS services'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: 'An error occurred while uploading the file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get upload status endpoint
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Here you would typically check the job status from a database
    // For now, we'll return a simple response
    res.status(200).json({
      success: true,
      data: {
        jobId: jobId,
        status: 'uploaded',
        message: 'File upload completed successfully'
      }
    });

  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: 'Unable to retrieve upload status'
    });
  }
});

// List all uploaded files
router.get('/files', async (req, res) => {
  try {
    console.log('Fetching files from S3 bucket:', S3_CONFIG.bucket);

    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucket,
      Prefix: S3_CONFIG.uploadPath,
      MaxKeys: 100
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      return res.status(200).json({
        success: true,
        files: [],
        count: 0,
        message: 'No files found'
      });
    }

    // Process files and extract metadata
    const files = await Promise.all(
      response.Contents.map(async (obj) => {
        try {
          // Get object metadata
          const headCommand = new GetObjectCommand({
            Bucket: S3_CONFIG.bucket,
            Key: obj.Key
          });

          const headResponse = await s3Client.send(headCommand);
          const metadata = headResponse.Metadata || {};

          // Extract file info from S3 key structure: uploads/jobId/filename
          const pathParts = obj.Key.split('/');
          const jobId = pathParts[1];
          const filename = pathParts[2] || obj.Key.split('/').pop();

          return {
            id: jobId || obj.Key.replace(/[^a-zA-Z0-9]/g, ''),
            filename: filename,
            originalName: metadata.originalname || filename,
            size: obj.Size,
            uploadedAt: obj.LastModified,
            status: 'uploaded', // Would come from database in real app
            jobId: jobId,
            fileType: headResponse.ContentType || 'unknown',
            s3Key: obj.Key,
            s3Bucket: S3_CONFIG.bucket,
            metadata: {
              lastModified: obj.LastModified,
              contentType: headResponse.ContentType,
              extension: filename.split('.').pop()?.toLowerCase()
            }
          };
        } catch (error) {
          console.error(`Error processing file ${obj.Key}:`, error);

          // Fallback object if metadata fetch fails
          const pathParts = obj.Key.split('/');
          const jobId = pathParts[1];
          const filename = pathParts[2] || obj.Key.split('/').pop();

          return {
            id: jobId || obj.Key.replace(/[^a-zA-Z0-9]/g, ''),
            filename: filename,
            originalName: filename,
            size: obj.Size,
            uploadedAt: obj.LastModified,
            status: 'uploaded',
            jobId: jobId,
            fileType: 'unknown',
            s3Key: obj.Key,
            s3Bucket: S3_CONFIG.bucket,
            metadata: {
              lastModified: obj.LastModified,
              extension: filename.split('.').pop()?.toLowerCase()
            }
          };
        }
      })
    );

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.status(200).json({
      success: true,
      files: files,
      count: files.length,
      bucket: S3_CONFIG.bucket
    });

  } catch (error) {
    console.error('Error fetching files:', error);

    if (error.name === 'CredentialsError') {
      return res.status(500).json({
        success: false,
        error: 'AWS credentials error',
        message: 'Unable to authenticate with AWS services'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch files',
      message: 'Unable to retrieve uploaded files',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get specific file details
router.get('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // List objects with the fileId prefix
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucket,
      Prefix: `${S3_CONFIG.uploadPath}${fileId}/`,
      MaxKeys: 1
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'No file found with the specified ID'
      });
    }

    const obj = response.Contents[0];

    // Get object metadata
    const headCommand = new GetObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: obj.Key
    });

    const headResponse = await s3Client.send(headCommand);
    const metadata = headResponse.Metadata || {};

    const pathParts = obj.Key.split('/');
    const filename = pathParts[2] || obj.Key.split('/').pop();

    const fileInfo = {
      id: fileId,
      filename: filename,
      originalName: metadata.originalname || filename,
      size: obj.Size,
      uploadedAt: obj.LastModified,
      status: 'uploaded',
      jobId: fileId,
      fileType: headResponse.ContentType || 'unknown',
      s3Key: obj.Key,
      s3Bucket: S3_CONFIG.bucket,
      metadata: {
        lastModified: obj.LastModified,
        contentType: headResponse.ContentType,
        extension: filename.split('.').pop()?.toLowerCase()
      }
    };

    res.status(200).json({
      success: true,
      data: fileInfo
    });

  } catch (error) {
    console.error('Error fetching file details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file',
      message: 'Unable to retrieve file details'
    });
  }
});

// Apply error handling middleware
router.use(handleMulterError);

export default router;