import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Trash2,
  Clock,
  Download,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileCode,
  FileImage,
  Archive,
  AlertTriangle,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteFile, getUploadedFiles } from '../services/api'

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  size: number
  uploadedAt: string
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'failed'
  jobId: string
  fileType: string
  analysisResult?: {
    threatLevel: 'low' | 'medium' | 'high' | 'critical'
    score: number
    findings: string[]
  }
}

interface FileExplorerProps {
  className?: string
  onFileSelect?: (file: UploadedFile) => void
  selectedFileId?: string
  onFileDeleted?: () => void
}

const FileExplorer = ({ className, onFileSelect, selectedFileId, onFileDeleted }: FileExplorerProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Fetch real files from S3
  const fetchFiles = async () => {
    try {
      setLoading(true)
      console.log('🔄 FileExplorer: Starting to fetch files from API...')

      const response = await getUploadedFiles()
      console.log('📦 FileExplorer: API response received:', response)

      if (response.success) {
        console.log('✅ FileExplorer: Setting files:', response.data?.length || 0, 'files')
        setFiles(response.data || [])
      } else {
        console.error('❌ FileExplorer: API returned failure:', response.message)
        setFiles([])
      }
    } catch (error: any) {
      console.error('💥 FileExplorer: Error fetching files:', error)
      setFiles([])
      // TODO: Show error toast/notification
    } finally {
      setLoading(false)
      console.log('🏁 FileExplorer: Fetch files completed')
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const getFileIcon = (fileType: string, size: 'sm' | 'md' = 'sm') => {
    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

    switch (fileType) {
      case 'script':
        return <FileCode className={cn(iconSize, 'text-blue-500')} />
      case 'image':
        return <FileImage className={cn(iconSize, 'text-green-500')} />
      case 'archive':
        return <Archive className={cn(iconSize, 'text-purple-500')} />
      default:
        return <FileText className={cn(iconSize, 'text-gray-500')} />
    }
  }

  const getStatusIcon = (status: string, threatLevel?: string) => {
    switch (status) {
      case 'analyzed':
        if (threatLevel === 'high' || threatLevel === 'critical') {
          return <AlertTriangle className="w-4 h-4 text-red-500" />
        }
        if (threatLevel === 'medium') {
          return <AlertCircle className="w-4 h-4 text-yellow-500" />
        }
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getThreatColor = (threatLevel?: string) => {
    switch (threatLevel) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-400'
    }
  }

  const handleDelete = async (fileId: string) => {
    setDeletingIds(prev => new Set(prev).add(fileId))

    try {
      // Delete file from S3 and database via API
      const response = await deleteFile(fileId)

      if (response.success) {
        // Remove file from local state
        setFiles(prev => prev.filter(f => f.id !== fileId))
        console.log('✅ File deleted successfully:', response.message)

        // Notify parent component about the deletion
        onFileDeleted?.()
      } else {
        throw new Error(response.message || 'Delete failed')
      }
    } catch (error: any) {
      console.error('Failed to delete file:', error)
      // TODO: Show error toast/notification
      alert(error.message || 'Failed to delete file')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
      setShowDeleteConfirm(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        <span className="ml-2 text-gray-500 text-sm">Loading files...</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
        <span className="text-sm text-gray-500">{files.length} files</span>
      </div>

      <AnimatePresence>
        {files.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No files uploaded yet</p>
          </motion.div>
        ) : (
          files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "group card p-3 transition-all duration-200 cursor-pointer hover:shadow-soft",
                selectedFileId === file.id ? "border-primary-200 bg-primary-50" : "border-gray-200"
              )}
              onClick={() => onFileSelect?.(file)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(file.fileType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </h4>
                      {getStatusIcon(file.status, file.analysisResult?.threatLevel)}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatTime(file.uploadedAt)}</span>
                      {file.analysisResult && (
                        <>
                          <span>•</span>
                          <span className={getThreatColor(file.analysisResult.threatLevel)}>
                            {file.analysisResult.threatLevel.toUpperCase()}
                          </span>
                        </>
                      )}
                    </div>

                    {file.status === 'analyzing' && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 text-xs text-blue-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Analysis in progress...</span>
                        </div>
                      </div>
                    )}

                    {file.analysisResult && file.analysisResult.findings.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">
                          {file.analysisResult.findings.slice(0, 1).map((finding, idx) => (
                            <div key={idx} className="flex items-center space-x-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{finding}</span>
                            </div>
                          ))}
                          {file.analysisResult.findings.length > 1 && (
                            <span className="text-gray-400">
                              +{file.analysisResult.findings.length - 1} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteConfirm(file.id)
                    }}
                    disabled={deletingIds.has(file.id)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                  >
                    {deletingIds.has(file.id) ? (
                      <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === file.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-gray-600 mb-3">
                    Delete this file permanently? This action cannot be undone.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deletingIds.has(file.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileExplorer