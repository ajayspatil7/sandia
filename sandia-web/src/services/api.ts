import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload file with progress tracking
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Upload failed',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Check upload status
export const getUploadStatus = async (jobId: string): Promise<any> => {
  try {
    const response = await api.get(`/upload/status/${jobId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Status check failed',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Health check
export const healthCheck = async (): Promise<any> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Health check failed',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// AWS health check
export const awsHealthCheck = async (): Promise<any> => {
  try {
    const response = await api.get('/health/aws');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'AWS health check failed',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Get all uploaded files
export const getUploadedFiles = async (): Promise<any> => {
  try {
    const response = await api.get('/files');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch files',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Delete file from S3 and database
export const deleteFile = async (fileId: string): Promise<any> => {
  try {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Failed to delete file',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Get file details and analysis results
export const getFileDetails = async (fileId: string): Promise<any> => {
  try {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch file details',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Get analysis results for a file by fileId
export const getAnalysisResults = async (fileId: string): Promise<any> => {
  try {
    const response = await api.get(`/analysis/results/${fileId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch analysis results',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Get analysis status for a file
export const getAnalysisStatus = async (fileId: string): Promise<any> => {
  try {
    const response = await api.get(`/analysis/status/${fileId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch analysis status',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

// Trigger Lambda analysis for a file
export const triggerAnalysis = async (
  fileId: string,
  s3Key: string,
  s3Bucket: string,
  fileName?: string
): Promise<any> => {
  try {
    const response = await api.post(`/analysis/trigger/${fileId}`, {
      s3Key,
      s3Bucket,
      fileName
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || 'Failed to trigger analysis',
        status: error.response?.status || 500,
        details: error.response?.data || {}
      };
    }
    throw error;
  }
};

export default api;