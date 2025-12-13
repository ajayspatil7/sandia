import express from 'express';
import { ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { S3_CONFIG } from '../config/aws.js';

const router = express.Router();

// List all uploaded files
router.get('/', async (req, res) => {
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
router.get('/:fileId', async (req, res) => {
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

// Delete file from S3
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    console.log(`Deleting file with ID: ${fileId}`);

    // List objects with the fileId prefix to find the file
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucket,
      Prefix: `${S3_CONFIG.uploadPath}${fileId}/`,
      MaxKeys: 10 // In case there are multiple files
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'No file found with the specified ID'
      });
    }

    // Delete all objects in this jobId folder
    const deletePromises = listResponse.Contents.map(obj => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucket,
        Key: obj.Key
      });
      console.log(`Deleting S3 object: ${obj.Key}`);
      return s3Client.send(deleteCommand);
    });

    await Promise.all(deletePromises);

    console.log(`Successfully deleted ${listResponse.Contents.length} file(s) for job ID: ${fileId}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: {
        fileId: fileId,
        deletedCount: listResponse.Contents.length,
        deletedKeys: listResponse.Contents.map(obj => obj.Key)
      }
    });

  } catch (error) {
    console.error('Error deleting file:', error);

    if (error.name === 'CredentialsError') {
      return res.status(500).json({
        success: false,
        error: 'AWS credentials error',
        message: 'Unable to authenticate with AWS services'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      message: 'An error occurred while deleting the file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;