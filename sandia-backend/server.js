import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import uploadRoutes from './routes/upload.js';
import healthRoutes from './routes/health.js';
import analysisRoutes from './routes/analysis.js';
import filesRoutes from './routes/files.js';
import mlRoutes from './routes/ml.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  }
});

app.use(limiter);

// File upload rate limiting (more restrictive)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per 15 minutes
  message: {
    success: false,
    error: 'Upload limit exceeded',
    message: 'Too many file uploads. Please try again later.'
  }
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/files', filesRoutes); // File listing endpoints (no rate limiter)
app.use('/api/analysis', analysisRoutes);
app.use('/api/ml', mlRoutes); // ML analysis endpoints

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sandia Cybersecurity Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      aws_health: '/api/health/aws',
      file_upload: 'POST /api/upload/file',
      upload_status: 'GET /api/upload/status/:jobId',
      trigger_analysis: 'POST /api/analysis/trigger/:fileId',
      analysis_results: 'GET /api/analysis/results/:fileId',
      analysis_status: 'GET /api/analysis/status/:fileId',
      ml_analyze: 'POST /api/ml/analyze/:fileId',
      ml_models_info: 'GET /api/ml/models/info',
      ml_health: 'GET /api/ml/health'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/health/aws',
      'POST /api/upload/file',
      'GET /api/upload/status/:jobId',
      'POST /api/analysis/trigger/:fileId',
      'GET /api/analysis/results/:fileId',
      'GET /api/analysis/status/:fileId',
      'POST /api/ml/analyze/:fileId',
      'GET /api/ml/models/info',
      'GET /api/ml/health'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: 'Server error',
    message: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Sandia Backend Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`☁️  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`🪣 S3 Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`📝 API Documentation available at http://localhost:${PORT}`);
  console.log('✅ Ready to accept file uploads!');
});

export default app;