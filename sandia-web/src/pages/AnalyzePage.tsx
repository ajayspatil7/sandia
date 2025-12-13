import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Cloud,
  Zap,
  Eye,
  Activity,
  Brain,
  Download,
  X,
  FileCode,
  FileImage,
  Archive,
  RefreshCw
} from 'lucide-react'
import SciFiBackground from '../components/SciFiBackground'
import { Progress } from '../components/ui/progress'
import { uploadFile } from '../services/api'

interface UploadResult {
  success: boolean
  jobId: string
  filename: string
  filesize: number
  uploadedAt: string
  message?: string
}

interface UploadError {
  message: string
  status: number
  details: any
}

const AnalyzePage = () => {
  const navigate = useNavigate()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (type.startsWith('image/')) return FileImage
    if (type.includes('script') || ['sh', 'py', 'js', 'ts'].includes(extension || '')) return FileCode
    if (['zip', 'rar', '7z', 'tar'].includes(extension || '')) return Archive
    return FileText
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('Preparing file for upload...')
    setUploadError(null)

    try {
      setUploadStatus('Uploading to secure environment...')

      const result = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress)
        if (progress < 50) {
          setUploadStatus('Uploading to secure environment...')
        } else if (progress < 80) {
          setUploadStatus('Validating file integrity...')
        } else if (progress < 95) {
          setUploadStatus('Processing upload...')
        } else {
          setUploadStatus('Upload complete!')
        }
      })

      setUploadResult({
        success: result.success,
        jobId: result.data.jobId,
        filename: result.data.filename,
        filesize: result.data.filesize,
        uploadedAt: result.data.uploadedAt,
        message: result.message
      })
      setUploadComplete(true)
      setUploadStatus('Upload successful!')
    } catch (error: any) {
      console.error('Upload failed:', error)
      setUploadError(error.message || 'Upload failed. Please try again.')
      setUploadStatus('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploading(false)
    setUploadComplete(false)
    setUploadProgress(0)
    setUploadStatus('')
    setUploadResult(null)
    setUploadError(null)
  }

  const retryUpload = () => {
    setUploadError(null)
    setUploadProgress(0)
    setUploadStatus('')
    handleFileUpload()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-950 sci-fi-background">
      {/* Sci-Fi Background */}
      <SciFiBackground />

      {/* Additional ambient lighting */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex justify-between items-center px-6 py-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-primary-200 hover:text-primary-400 transition-colors duration-200 font-cyber"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-cyber">BACK TO HOME</span>
        </motion.button>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary-200 glow-matrix" />
            <div className="absolute inset-0 w-8 h-8 text-primary-200 animate-primary-glow opacity-50"></div>
          </div>
          <span className="text-2xl font-bold text-primary-200 text-brand font-tactical">SANDIA</span>
        </div>

        <div className="w-24"></div>
      </motion.nav>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!uploadComplete ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-6 heading-primary">
                  <span className="text-primary-200">FILE UPLOAD</span>
                </h1>
                <p className="text-xl text-dark-300 mb-12 max-w-2xl mx-auto text-body font-cyber">
                  UPLOAD ANY FILE TO OUR SECURE ENVIRONMENT FOR CYBERSECURITY ANALYSIS
                </p>

                {!uploading && !selectedFile && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`relative border-2 border-dashed rounded-3xl p-16 transition-all duration-300 ${
                      dragActive
                        ? 'border-primary-400 bg-primary-400/5 scale-105'
                        : 'border-dark-600 hover:border-primary-500 hover:bg-primary-500/5'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept="*/*"
                    />

                    <motion.div
                      animate={{ y: dragActive ? -5 : 0 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: dragActive ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-24 h-24 mx-auto mb-6 relative"
                        >
                          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                            dragActive ? 'bg-gradient-to-r from-primary-400 to-primary-500' : 'bg-gradient-to-r from-primary-500 to-primary-600'
                          }`}></div>
                          <div className="relative w-full h-full bg-dark-900 rounded-full flex items-center justify-center m-1">
                            <Upload className="w-12 h-12 text-primary-200" />
                          </div>
                        </motion.div>
                      </div>

                      <div>
                        <h3 className="text-2xl font-semibold mb-4 text-primary-200 heading-secondary font-tactical">
                          {dragActive ? 'DROP YOUR FILE HERE' : 'DRAG & DROP YOUR FILE'}
                        </h3>
                        <p className="text-dark-400 mb-6 text-body font-cyber">
                          OR <span className="text-primary-200 cursor-pointer hover:underline">BROWSE TO CHOOSE A FILE</span>
                        </p>
                        <p className="text-sm text-dark-500 text-body font-mono">
                          SUPPORTS ALL FILE TYPES • MAXIMUM SIZE: 100MB
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {selectedFile && !uploading && !uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-tactical rounded-sm p-8 mb-8 hover-tactical"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        {(() => {
                          const IconComponent = getFileIcon(selectedFile)
                          return <IconComponent className="w-8 h-8 text-primary-500" />
                        })()}
                        <div className="text-left">
                          <h3 className="font-semibold text-lg text-code text-primary-200">{selectedFile.name}</h3>
                          <p className="text-dark-400 text-sm text-code">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={resetUpload}
                        className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-threat-critical" />
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFileUpload}
                      className="btn-primary text-lg py-4 group w-full"
                    >
                      UPLOAD FILE
                      <Upload className="w-5 h-5 ml-2 group-hover:animate-pulse" />
                    </motion.button>
                  </motion.div>
                )}

                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-tactical rounded-sm p-8 border-l-4 border-threat-critical mb-8 hover-tactical"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <AlertTriangle className="w-8 h-8 text-threat-critical" />
                      <div>
                        <h3 className="text-xl font-semibold text-threat-critical heading-secondary font-tactical">UPLOAD FAILED</h3>
                        <p className="text-dark-400 text-body font-mono">{uploadError}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={retryUpload}
                        className="btn-primary flex items-center justify-center"
                        disabled={uploading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        RETRY UPLOAD
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetUpload}
                        className="btn-secondary"
                      >
                        CHOOSE DIFFERENT FILE
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {uploading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-tactical rounded-sm p-8 hover-tactical"
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-6"
                      >
                        <div className="w-full h-full border-4 border-primary-500/30 border-t-primary-500 rounded-full"></div>
                      </motion.div>
                      <h3 className="text-2xl font-semibold mb-2 heading-secondary font-tactical text-primary-200">UPLOADING FILE</h3>
                      <p className="text-dark-400 text-body font-mono">{uploadStatus.toUpperCase()}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-slate-400">
                        <span className="font-mono">UPLOAD PROGRESS</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      {[
                        { icon: Cloud, label: 'Secure Upload', done: uploadProgress > 25 },
                        { icon: Shield, label: 'File Validation', done: uploadProgress > 70 },
                        { icon: CheckCircle, label: 'Processing', done: uploadProgress > 95 }
                      ].map((step, index) => (
                        <div key={index} className="text-center">
                          <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${
                            step.done ? 'bg-primary-400/20 text-primary-200' : 'bg-dark-700 text-dark-400'
                          }`}>
                            {step.done ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                          </div>
                          <span className={`text-xs font-mono ${step.done ? 'text-primary-200' : 'text-dark-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4 heading-primary">
                    UPLOAD <span className="text-primary-200">SUCCESSFUL!</span>
                  </h1>
                  <p className="text-dark-300 text-body font-cyber">
                    YOUR FILE <span className="text-primary-200 text-code">{selectedFile?.name}</span> HAS BEEN UPLOADED SUCCESSFULLY
                  </p>
                </div>

                {uploadResult && (
                  <div className="space-y-6">
                    {/* Upload Success Status */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="card-tactical rounded-sm p-8 border-l-4 border-primary-500 hover-tactical"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <CheckCircle className="w-12 h-12 text-primary-500" />
                          <div>
                            <h3 className="text-2xl font-bold heading-secondary text-primary-200 font-tactical">UPLOAD COMPLETE</h3>
                            <p className="text-dark-400 text-body font-mono">FILE UPLOADED SUCCESSFULLY</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-primary-200 heading-secondary font-tactical">UPLOAD DETAILS</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                              <span className="text-dark-300 text-sm text-body font-mono">JOB ID: <span className="text-code">{uploadResult.jobId}</span></span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                              <span className="text-dark-300 text-sm text-body font-mono">FILENAME: <span className="text-code">{uploadResult.filename}</span></span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                              <span className="text-dark-300 text-sm text-body font-mono">SIZE: <span className="text-code">{(uploadResult.filesize / 1024 / 1024).toFixed(2)} MB</span></span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                              <span className="text-dark-300 text-sm text-body font-mono">UPLOADED: <span className="text-code">{new Date(uploadResult.uploadedAt).toLocaleString()}</span></span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-primary-400 heading-secondary font-tactical">NEXT STEPS</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start space-x-2">
                              <Eye className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                              <span className="text-dark-300 text-sm text-body font-mono">FILE IS QUEUED FOR ANALYSIS</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <Activity className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                              <span className="text-dark-300 text-sm text-body font-mono">ANALYSIS WILL BEGIN SHORTLY</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <Brain className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                              <span className="text-dark-300 text-sm text-body font-mono">CHECK DASHBOARD FOR RESULTS</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>

                    {/* File Information */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="card-tactical rounded-sm p-6 hover-tactical"
                    >
                      <h3 className="text-xl font-semibold mb-4 flex items-center heading-secondary font-tactical text-primary-200">
                        <FileText className="w-5 h-5 mr-2 text-primary-500" />
                        FILE INFORMATION
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-dark-300 mb-2 heading-secondary font-cyber">FILE DETAILS</h4>
                          <div className="text-sm text-dark-400 space-y-1 text-code font-mono">
                            <p>NAME: {selectedFile?.name}</p>
                            <p>TYPE: {selectedFile?.type || 'UNKNOWN'}</p>
                            <p>SIZE: {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-300 mb-2 heading-secondary font-cyber">UPLOAD STATUS</h4>
                          <div className="text-sm text-dark-400 space-y-1 text-code font-mono">
                            <p>STATUS: <span className="text-primary-200">COMPLETE</span></p>
                            <p>PROGRESS: <span className="text-primary-200">100%</span></p>
                            <p>QUEUE POSITION: <span className="text-primary-400">PROCESSING</span></p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-300 mb-2 heading-secondary font-cyber">SECURITY</h4>
                          <div className="text-sm text-dark-400 space-y-1 text-code font-mono">
                            <p>ENCRYPTED: <span className="text-primary-200">YES</span></p>
                            <p>SANDBOXED: <span className="text-primary-200">YES</span></p>
                            <p>ISOLATED: <span className="text-primary-200">YES</span></p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary"
                      >
                        GO TO DASHBOARD
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetUpload}
                        className="btn-secondary"
                      >
                        UPLOAD ANOTHER FILE
                        <Upload className="w-4 h-4 ml-2" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                      >
                        BACK TO HOME
                      </motion.button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AnalyzePage