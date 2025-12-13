import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  Shield,
  FileText,
  Calendar,
  HardDrive,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  File,
  FileCode,
  FileImage,
  FileArchive,
  Folder,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { getUploadedFiles, deleteFile } from '../services/api'

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  size: number
  uploadedAt: string
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'failed'
  jobId: string
  fileType: string
  s3Key?: string
  s3Bucket?: string
  metadata?: {
    lastModified?: string
    contentType?: string
    extension?: string
  }
}

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

const getFileTypeDisplay = (fileType: string, extension: string): string => {
  if (fileType) return fileType

  switch (extension) {
    case 'sh': return 'Shell Script'
    case 'py': return 'Python Script'
    case 'js': return 'JavaScript'
    case 'ts': return 'TypeScript'
    case 'exe': return 'Windows Executable'
    case 'bin': return 'Binary File'
    case 'txt': return 'Text Document'
    case 'pdf': return 'PDF Document'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return 'Image File'
    case 'zip':
    case 'tar':
    case 'gz': return 'Archive File'
    default: return 'Unknown File Type'
  }
}

const getFileIcon = (extension: string, size = 'w-6 h-6') => {
  switch (extension.toLowerCase()) {
    case 'sh':
    case 'py':
    case 'js':
    case 'ts':
      return <FileCode className={cn(size, 'text-primary-400')} />
    case 'exe':
    case 'bin':
      return <File className={cn(size, 'text-red-400')} />
    case 'txt':
    case 'pdf':
      return <FileText className={cn(size, 'text-blue-400')} />
    case 'zip':
    case 'tar':
    case 'gz':
      return <FileArchive className={cn(size, 'text-orange-400')} />
    case 'jpg':
    case 'png':
    case 'gif':
      return <FileImage className={cn(size, 'text-green-400')} />
    default:
      return <File className={cn(size, 'text-dark-400')} />
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'analyzed':
      return (
        <div className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>Analyzed</span>
        </div>
      )
    case 'analyzing':
      return (
        <div className="inline-flex items-center space-x-1 bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">
          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing</span>
        </div>
      )
    case 'failed':
      return (
        <div className="inline-flex items-center bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
          <span>Failed</span>
        </div>
      )
    default:
      return (
        <div className="inline-flex items-center bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
          <span>Uploaded</span>
        </div>
      )
  }
}

export default function FileSelectionPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  // Fetch files from S3 via API
  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching files from API...')
      const response = await getUploadedFiles()
      console.log('API Response:', response)

      // Handle the response structure - it might be response.files or response.data
      const filesData = response.files || response.data || response || []
      setFiles(filesData)
    } catch (err: any) {
      console.error('Error fetching files:', err)
      setError(err.message || 'Failed to fetch files from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleProceed = () => {
    if (selectedFile) {
      // Pass file metadata to STATA page via URL parameters and state
      const params = new URLSearchParams({
        fileId: selectedFile.id,
        s3Key: selectedFile.s3Key || '',
        s3Bucket: selectedFile.s3Bucket || '',
        fileName: selectedFile.originalName || selectedFile.filename
      })
      navigate(`/stata?${params.toString()}`)
    }
  }

  const handleDeleteFile = async (fileId: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent file selection when clicking delete

    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingFileId(fileId)
      console.log(`Deleting file: ${fileId}`)

      await deleteFile(fileId)

      // Remove file from local state
      setFiles(prev => prev.filter(f => f.id !== fileId))

      // Clear selection if deleted file was selected
      if (selectedFile?.id === fileId) {
        setSelectedFile(null)
      }

      console.log(`File deleted successfully: ${fileId}`)
    } catch (err: any) {
      console.error('Error deleting file:', err)
      alert(`Failed to delete file: ${err.message || 'Unknown error'}`)
    } finally {
      setDeletingFileId(null)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 py-12"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-600/20 to-primary-500/20 px-6 py-3 rounded-full border border-primary-400/30 mb-2"
            >
              <Shield className="w-6 h-6 text-primary-400" />
              <h1 className="text-xl font-bold text-primary-200 font-tactical">
                STATA - FILE SELECTION
              </h1>
            </motion.div>
            <p className="text-dark-300 max-w-2xl">
              Select a file from your uploaded samples to perform static analysis. Files are securely stored in AWS S3.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" />
              <p className="text-dark-300">Loading files from S3...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-400/30 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="font-medium text-red-200">Failed to Load Files</h3>
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchFiles}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && files.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-400 mb-2">No Files Found</h3>
            <p className="text-dark-500">No files have been uploaded to S3 yet. Upload some files to get started.</p>
          </div>
        )}

        {/* File Grid */}
        {!loading && !error && files.length > 0 && (
          <div className="grid gap-4 mb-8">
            {files.map((file, index) => {
              const extension = getFileExtension(file.filename || file.originalName)
              const displayType = getFileTypeDisplay(file.fileType, extension)

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setSelectedFile(file)}
                  className={cn(
                    "bg-dark-800/50 rounded-xl p-6 border transition-all duration-200 cursor-pointer",
                    selectedFile?.id === file.id
                      ? "border-primary-400/50 bg-primary-600/10 shadow-lg shadow-primary-500/20"
                      : "border-primary-200/10 hover:border-primary-400/30 hover:bg-dark-700/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* File Icon */}
                      <div className="p-3 bg-dark-700/50 rounded-lg">
                        {getFileIcon(extension, 'w-8 h-8')}
                      </div>

                      {/* File Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-primary-200 text-lg font-tactical">
                            {file.originalName || file.filename}
                          </h3>
                          {getStatusBadge(file.status)}

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteFile(file.id, file.originalName || file.filename, e)}
                            disabled={deletingFileId === file.id}
                            className={cn(
                              "p-2 rounded-lg transition-all duration-200",
                              deletingFileId === file.id
                                ? "bg-red-600/20 cursor-not-allowed"
                                : "hover:bg-red-600/20 text-dark-400 hover:text-red-400"
                            )}
                            title="Delete file"
                          >
                            {deletingFileId === file.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-dark-300">
                            <HardDrive className="w-4 h-4" />
                            <span>{formatFileSize(file.size)}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-dark-300">
                            <FileText className="w-4 h-4" />
                            <span>{displayType}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-dark-300">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-2 space-y-1">
                          {file.s3Key && (
                            <div className="text-xs text-dark-500 font-mono">
                              S3: {file.s3Key}
                            </div>
                          )}
                          {file.jobId && (
                            <div className="text-xs text-dark-500 font-mono">
                              Job: {file.jobId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedFile?.id === file.id && (
                      <div className="ml-4">
                        <CheckCircle className="w-6 h-6 text-primary-400" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Selected File Summary and Proceed Button */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-primary-600/10 to-primary-500/10 rounded-2xl p-8 border border-primary-400/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-primary-200 mb-2 font-tactical">
                  Selected File: {selectedFile.originalName || selectedFile.filename}
                </h3>
                <p className="text-dark-300">
                  {selectedFile.status === 'analyzed'
                    ? 'This file has been analyzed and results are available for viewing.'
                    : selectedFile.status === 'analyzing'
                    ? 'This file is currently being analyzed. Limited information may be available.'
                    : selectedFile.status === 'failed'
                    ? 'Analysis failed for this file. You can still view file metadata.'
                    : 'This file is ready for analysis.'
                  }
                </p>
              </div>

              <button
                onClick={handleProceed}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-primary-500/25"
              >
                <span>Proceed to Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-dark-800/30 rounded-xl p-6 text-center border border-primary-200/10">
            <div className="text-2xl font-bold text-primary-400 mb-2">{files.length}</div>
            <div className="text-sm text-dark-400">Total Files</div>
          </div>

          <div className="bg-dark-800/30 rounded-xl p-6 text-center border border-primary-200/10">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {files.filter(f => f.status === 'analyzed').length}
            </div>
            <div className="text-sm text-dark-400">Analyzed</div>
          </div>

          <div className="bg-dark-800/30 rounded-xl p-6 text-center border border-primary-200/10">
            <div className="text-2xl font-bold text-orange-400 mb-2">
              {files.filter(f => f.status === 'analyzing').length}
            </div>
            <div className="text-sm text-dark-400">Processing</div>
          </div>

          <div className="bg-dark-800/30 rounded-xl p-6 text-center border border-primary-200/10">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)} MB
            </div>
            <div className="text-sm text-dark-400">Total Size</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}