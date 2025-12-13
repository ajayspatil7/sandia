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
  ArrowLeft,
  Menu,
  X,
  TrendingUp,
  Info,
  Code,
  Target,
  Activity,
  Download,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Cpu,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink
} from 'lucide-react'
import { StaticAnalysisResult } from '../types/analysis'
import { getAnalysisResults, triggerAnalysis } from '../services/api'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  analysisResult?: StaticAnalysisResult
}

export default function EnhancedSTATAPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisTriggered, setAnalysisTriggered] = useState(false)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]))

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
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
    }
  }

  // Fetch real analysis results
  const fetchAnalysisResults = async (fileId: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching analysis results for file:', fileId)

      const results = await getAnalysisResults(fileId)

      if (results.success && results.data) {
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
        setError('Analysis results not found. The analysis may still be in progress, please wait and try again.')
      } else {
        setError(err.message || 'Failed to load analysis results. Please try again.')
      }

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
      const initAnalysis = async () => {
        if (s3Key && s3Bucket && fileName) {
          await triggerLambdaAnalysis(fileId, s3Key, s3Bucket, fileName)
          await new Promise(resolve => setTimeout(resolve, 5000))
        }

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
      }, 5000)

      return () => clearTimeout(pollTimer)
    }
  }, [analysisTriggered, error, pollingAttempts, searchParams])

  const sections = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'threats', name: 'Threats', icon: AlertTriangle },
    { id: 'behavior', name: 'Behavior', icon: Brain },
    { id: 'network', name: 'Network', icon: Globe },
    { id: 'commands', name: 'Commands', icon: Terminal },
    { id: 'hashes', name: 'Hashes & Strings', icon: Hash },
    { id: 'code', name: 'Code Analysis', icon: Code },
    { id: 'mitre', name: 'MITRE ATT&CK', icon: Target }
  ]

  const analysis = selectedFile?.analysisResult

  // Helper functions
  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'info': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getVerdictIcon = (verdict?: string) => {
    switch (verdict?.toUpperCase()) {
      case 'MALICIOUS': return <XCircle className="w-6 h-6 text-red-500" />
      case 'SUSPICIOUS': return <AlertCircle className="w-6 h-6 text-yellow-500" />
      case 'CLEAN': return <CheckCircle className="w-6 h-6 text-green-500" />
      default: return <Info className="w-6 h-6 text-gray-500" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Render functions for each tab
  const renderOverview = () => {
    if (!analysis) return <div>No analysis data available</div>

    const executive = analysis.executive_summary
    const risk = analysis.risk_assessment
    const stats = analysis.quick_stats

    return (
      <div className="space-y-6">
        {/* Executive Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {getVerdictIcon(executive?.verdict)}
              <div>
                <h2 className="text-2xl font-bold text-white">{executive?.verdict || 'Unknown'}</h2>
                <p className="text-slate-400 text-sm">Analysis Verdict</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{executive?.confidence || 0}%</div>
              <p className="text-slate-400 text-sm">Confidence</p>
            </div>
          </div>

          {/* Risk Score Gauge */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300">Risk Score</span>
              <span className="text-2xl font-bold text-white">{risk.risk_score_percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk.risk_score_percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  risk.risk_score_percentage >= 60 ? "bg-gradient-to-r from-red-500 to-red-600" :
                  risk.risk_score_percentage >= 35 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                  "bg-gradient-to-r from-green-500 to-green-600"
                )}
              />
            </div>
          </div>

          {/* Primary Threat & Family */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <p className="text-slate-400 text-sm mb-1">Primary Threat</p>
              <p className="text-white font-semibold">{executive?.primary_threat || 'Unknown'}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <p className="text-slate-400 text-sm mb-1">Malware Family</p>
              <p className="text-white font-semibold">{executive?.malware_family || 'Unknown'}</p>
              {executive?.family_confidence && executive.family_confidence > 0 && (
                <p className="text-xs text-slate-500 mt-1">{executive.family_confidence}% confidence</p>
              )}
            </div>
          </div>

          {/* Attack Chain */}
          {executive?.attack_chain && executive.attack_chain.length > 0 && (
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Attack Chain</p>
              <div className="flex items-center gap-2 flex-wrap">
                {executive.attack_chain.map((step, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-3 py-1.5">
                      <span className="text-cyan-300 text-sm font-medium">{step}</span>
                    </div>
                    {idx < executive.attack_chain.length - 1 && (
                      <ChevronDown className="w-4 h-4 text-slate-600 mx-1 rotate-[-90deg]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Findings */}
          {executive?.key_findings && executive.key_findings.length > 0 && (
            <div>
              <p className="text-slate-400 text-sm mb-3">Key Findings</p>
              <div className="space-y-2">
                {executive.key_findings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">{finding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={AlertTriangle} label="Threats" value={stats.total_threats} color="text-red-500" />
            <StatCard icon={Terminal} label="Commands" value={stats.total_commands} color="text-cyan-500" />
            <StatCard icon={Globe} label="IPs Found" value={stats.total_ips} color="text-blue-500" />
            <StatCard icon={Server} label="C2 Servers" value={stats.c2_servers} color="text-orange-500" />
            <StatCard icon={Download} label="Downloads" value={stats.total_downloads} color="text-purple-500" />
            <StatCard icon={Target} label="MITRE Tactics" value={stats.mitre_tactics} color="text-green-500" />
            <StatCard icon={Lock} label="Persistence" value={stats.persistence_mechanisms} color="text-yellow-500" />
            <StatCard icon={Activity} label="Evasion" value={stats.evasion_techniques} color="text-pink-500" />
          </div>
        )}

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "border rounded-xl p-6",
            getSeverityColor(risk.severity)
          )}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Recommendation</h3>
              <p className="text-sm opacity-90">{risk.recommendation}</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderThreats = () => {
    if (!analysis?.threat_indicators || analysis.threat_indicators.length === 0) {
      return <div className="text-center text-slate-400 py-12">No threat indicators detected</div>
    }

    return (
      <div className="space-y-4">
        {analysis.threat_indicators.map((threat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => toggleExpanded(idx)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold border",
                      getSeverityColor(threat.severity || 'medium')
                    )}>
                      {threat.severity?.toUpperCase() || 'MEDIUM'}
                    </span>
                    <h3 className="text-white font-semibold">{threat.category}</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{threat.description || threat.type}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{threat.matches} matches</span>
                    <span>Weight: {threat.weight}</span>
                    <span className="text-red-400">+{threat.score_added} risk score</span>
                  </div>
                </div>
                {expandedItems.has(idx) ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            {expandedItems.has(idx) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-700/50 p-4 bg-slate-900/30"
              >
                {/* Samples */}
                {threat.samples && threat.samples.length > 0 && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-2">Sample Evidence:</p>
                    <div className="space-y-1">
                      {threat.samples.map((sample, sIdx) => (
                        <div key={sIdx} className="bg-slate-950/50 rounded px-3 py-2 font-mono text-xs text-cyan-400">
                          {sample}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MITRE ATT&CK */}
                {threat.mitre_attack && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-2">MITRE ATT&CK Mapping:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-green-500/20 border border-green-500/30 rounded px-2 py-1 text-xs text-green-300">
                        {threat.mitre_attack.tactic} - {threat.mitre_attack.tactic_name}
                      </span>
                      <span className="bg-blue-500/20 border border-blue-500/30 rounded px-2 py-1 text-xs text-blue-300">
                        {threat.mitre_attack.technique} - {threat.mitre_attack.technique_name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Remediation */}
                {threat.remediation && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Remediation:</p>
                    <p className="text-slate-300 text-sm bg-slate-950/50 rounded px-3 py-2">
                      {threat.remediation}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  const renderBehavior = () => {
    if (!analysis?.behavioral_analysis) {
      return <div className="text-center text-slate-400 py-12">No behavioral data available</div>
    }

    const behavioral = analysis.behavioral_analysis
    const behaviors = behavioral.behaviors
    const capability = behavioral.capability_matrix
    const execution = analysis.execution_analysis

    return (
      <div className="space-y-6">
        {/* Behavior Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Detected Behaviors ({behavioral.risk_behavior_count}/{behavioral.total_behaviors_checked})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(behaviors).map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  value ? "bg-red-500/10 border-red-500/30" : "bg-slate-900/50 border-slate-700/30"
                )}
              >
                {value ? (
                  <CheckCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
                <span className={cn(
                  "text-sm",
                  value ? "text-red-300" : "text-slate-500"
                )}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Capability Matrix */}
        {capability && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Capability Assessment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(capability).map(([key, value]) => (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg border text-center",
                    value ? "bg-orange-500/10 border-orange-500/30" : "bg-slate-900/50 border-slate-700/30"
                  )}
                >
                  {value ? <Unlock className="w-6 h-6 text-orange-400 mb-2" /> : <Lock className="w-6 h-6 text-slate-600 mb-2" />}
                  <span className={cn(
                    "text-xs font-medium",
                    value ? "text-orange-300" : "text-slate-500"
                  )}>
                    {key.replace(/^can_/, '').replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Execution Flow */}
        {execution && execution.execution_flow && execution.execution_flow.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Execution Flow ({execution.total_execution_steps} steps)
            </h3>
            <div className="space-y-2">
              {execution.execution_flow.slice(0, 10).map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center">
                    <span className="text-xs text-cyan-400 font-semibold">{idx + 1}</span>
                  </div>
                  <p className="text-slate-300 text-sm flex-1">{step}</p>
                </div>
              ))}
              {execution.execution_flow.length > 10 && (
                <p className="text-slate-500 text-xs text-center py-2">
                  ... and {execution.execution_flow.length - 10} more steps
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Impact Analysis */}
        {execution?.impact_analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4">Impact Analysis (CIA Triad)</h3>
            <div className="grid grid-cols-3 gap-4">
              <ImpactCard label="Confidentiality" value={execution.impact_analysis.confidentiality} />
              <ImpactCard label="Integrity" value={execution.impact_analysis.integrity} />
              <ImpactCard label="Availability" value={execution.impact_analysis.availability} />
            </div>
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
              <p className="text-slate-400 text-sm">
                Scope: <span className="text-white font-semibold">{execution.impact_analysis.scope}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Code Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">Code Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Lines" value={behavioral.code_metrics.total_lines} />
            <MetricCard label="Unique Lines" value={behavioral.code_metrics.unique_lines} />
            <MetricCard label="Repetition Ratio" value={behavioral.code_metrics.repetition_ratio.toFixed(2)} />
            <MetricCard
              label="Avg Line Length"
              value={behavioral.code_metrics.average_line_length?.toFixed(0) || 'N/A'}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  const renderNetwork = () => {
    if (!analysis?.network_analysis) {
      return <div className="text-center text-slate-400 py-12">No network data available</div>
    }

    const network = analysis.network_analysis

    return (
      <div className="space-y-6">
        {/* Network Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Network} label="Connections" value={network.total_connections} color="text-blue-500" />
          <StatCard icon={Server} label="C2 Servers" value={network.c2_servers.length} color="text-red-500" />
          <StatCard icon={Download} label="Downloads" value={network.total_downloads} color="text-purple-500" />
          <StatCard icon={Globe} label="Unique IPs" value={network.connections.length} color="text-cyan-500" />
        </div>

        {/* C2 Servers */}
        {network.c2_servers && network.c2_servers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-red-500" />
              Command & Control Servers ({network.c2_servers.length})
            </h3>
            <div className="space-y-3">
              {network.c2_servers.map((c2, idx) => (
                <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-red-300 font-semibold">{c2.ip}</span>
                        <button
                          onClick={() => copyToClipboard(c2.ip)}
                          className="p-1 hover:bg-red-500/20 rounded"
                        >
                          <Copy className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Type: {c2.type}</span>
                        <span className="text-red-400">{c2.confidence}% confidence</span>
                      </div>
                      {c2.indicators && c2.indicators.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {c2.indicators.map((indicator, iIdx) => (
                            <span key={iIdx} className="text-xs bg-red-500/20 rounded px-2 py-1 text-red-300">
                              {indicator}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Network Connections */}
        {network.connections && network.connections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Network Connections ({network.connections.length})
            </h3>
            <div className="space-y-2">
              {network.connections.map((conn, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-cyan-300 font-semibold">{conn.ip}</span>
                        {conn.port && (
                          <span className="text-slate-500 text-sm">:{conn.port}</span>
                        )}
                        <button
                          onClick={() => copyToClipboard(conn.ip)}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        {conn.protocol && <span>Protocol: {conn.protocol}</span>}
                        {conn.direction && <span>Direction: {conn.direction}</span>}
                        {conn.reputation && (
                          <span className={cn(
                            conn.reputation === 'malicious' ? 'text-red-400' :
                            conn.reputation === 'suspicious' ? 'text-yellow-400' :
                            'text-slate-400'
                          )}>
                            Reputation: {conn.reputation}
                          </span>
                        )}
                      </div>
                      {conn.geolocation && conn.geolocation !== 'Unknown' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{conn.geolocation}</span>
                        </div>
                      )}
                      {conn.context && conn.context.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {conn.context.map((ctx, cIdx) => (
                            <span key={cIdx} className="text-xs bg-blue-500/20 rounded px-2 py-1 text-blue-300">
                              {ctx}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Downloaded Files */}
        {network.downloaded_files && network.downloaded_files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Downloaded Files ({network.downloaded_files.length})
            </h3>
            <div className="space-y-2">
              {network.downloaded_files.slice(0, 10).map((file, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    {file.likely_malicious && (
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-cyan-300 text-sm font-mono truncate flex-1">{file.url}</span>
                  </div>
                  {file.method && (
                    <span className="text-xs text-slate-500">Method: {file.method}</span>
                  )}
                </div>
              ))}
              {network.downloaded_files.length > 10 && (
                <p className="text-slate-500 text-xs text-center py-2">
                  ... and {network.downloaded_files.length - 10} more files
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderCommands = () => {
    if (!analysis?.command_sequence && !analysis?.commands_detected) {
      return <div className="text-center text-slate-400 py-12">No command data available</div>
    }

    const sequence = analysis.command_sequence
    const commands = analysis.commands_detected

    return (
      <div className="space-y-6">
        {/* Command Stats */}
        {sequence && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={Terminal} label="Total Commands" value={sequence.total_commands} color="text-cyan-500" />
            <StatCard icon={AlertTriangle} label="High Risk" value={sequence.high_risk_commands} color="text-red-500" />
            <StatCard icon={Target} label="Dangerous Patterns" value={sequence.dangerous_patterns.length} color="text-orange-500" />
          </div>
        )}

        {/* Dangerous Patterns */}
        {sequence?.dangerous_patterns && sequence.dangerous_patterns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Dangerous Patterns ({sequence.dangerous_patterns.length})
            </h3>
            <div className="space-y-3">
              {sequence.dangerous_patterns.map((pattern, idx) => (
                <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-red-300 font-semibold">{pattern.pattern}</h4>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-semibold",
                      getSeverityColor(pattern.severity)
                    )}>
                      {pattern.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{pattern.description}</p>
                  <p className="text-slate-500 text-xs">Found {pattern.count} time(s)</p>
                  {pattern.samples && pattern.samples.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {pattern.samples.map((sample, sIdx) => (
                        <div key={sIdx} className="bg-slate-950/50 rounded px-3 py-2 font-mono text-xs text-cyan-400">
                          {sample}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Command Sequence */}
        {sequence?.sequence && sequence.sequence.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Command Execution Sequence
            </h3>
            <div className="space-y-2">
              {sequence.sequence.slice(0, 15).map((cmd, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold",
                    cmd.risk === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    cmd.risk === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    cmd.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                  )}>
                    {cmd.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-cyan-300 break-all">{cmd.command}</div>
                    {cmd.primary_command && (
                      <span className="text-xs text-slate-500 mt-1 inline-block">
                        Primary: {cmd.primary_command}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "flex-shrink-0 px-2 py-1 rounded text-xs font-semibold",
                    getSeverityColor(cmd.risk)
                  )}>
                    {cmd.risk.toUpperCase()}
                  </span>
                </div>
              ))}
              {sequence.sequence.length > 15 && (
                <p className="text-slate-500 text-xs text-center py-2">
                  ... and {sequence.sequence.length - 15} more commands
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Commands by Category */}
        {commands && Object.keys(commands).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4">Commands by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(commands).map(([category, cmdList]) => {
                if (!cmdList || cmdList.length === 0) return null
                return (
                  <div key={category} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <h4 className="text-white font-semibold text-sm mb-3 capitalize">
                      {category.replace(/_/g, ' ')}
                    </h4>
                    <div className="space-y-2">
                      {cmdList.map((cmd, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-cyan-300 font-mono">{cmd.command}</span>
                          <span className="text-slate-500">×{cmd.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderHashes = () => {
    if (!analysis?.hashes || !analysis?.strings_analysis) {
      return <div className="text-center text-slate-400 py-12">No hash/string data available</div>
    }

    const hashes = analysis.hashes
    const strings = analysis.strings_analysis

    return (
      <div className="space-y-6">
        {/* File Hashes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            File Hashes
          </h3>
          <div className="space-y-3">
            {['md5', 'sha1', 'sha256'].map((hashType) => (
              <div key={hashType} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-slate-400 text-xs uppercase mb-1">{hashType}</p>
                  <p className="text-cyan-300 font-mono text-sm break-all">{hashes[hashType as keyof typeof hashes]}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(hashes[hashType as keyof typeof hashes] as string)}
                  className="flex-shrink-0 p-2 hover:bg-slate-700 rounded"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>

          {/* VirusTotal */}
          {hashes.virustotal_detection && (
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-purple-300 font-semibold">VirusTotal Detection</h4>
                {hashes.virustotal_detection.permalink && (
                  <a
                    href={hashes.virustotal_detection.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    View Report <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-white text-lg font-bold">
                {hashes.virustotal_detection.detected}/{hashes.virustotal_detection.total_engines} engines detected
              </p>
            </div>
          )}
        </motion.div>

        {/* String Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Strings" value={strings.total_strings} color="text-cyan-500" />
          <StatCard icon={Globe} label="URLs Found" value={strings.urls_found.length} color="text-blue-500" />
          <StatCard icon={Network} label="IP Addresses" value={strings.ip_addresses.length} color="text-purple-500" />
          <StatCard icon={Server} label="Domains" value={strings.domains.length} color="text-green-500" />
        </div>

        {/* URLs */}
        {strings.urls_found && strings.urls_found.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              URLs Found ({strings.urls_found.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {strings.urls_found.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-cyan-300 text-sm font-mono truncate flex-1">{url}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(url)}
                      className="p-1.5 hover:bg-slate-700 rounded"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-700 rounded"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* IP Addresses */}
        {strings.ip_addresses && strings.ip_addresses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Network className="w-5 h-5" />
              IP Addresses ({strings.ip_addresses.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {strings.ip_addresses.map((ip, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <span className="text-cyan-300 font-mono text-sm">{ip}</span>
                  <button
                    onClick={() => copyToClipboard(ip)}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suspicious Keywords */}
        {strings.suspicious_keywords && strings.suspicious_keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Suspicious Keywords ({strings.suspicious_keywords.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {strings.suspicious_keywords.map((keyword, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm font-mono">
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* File Paths */}
        {strings.file_paths && strings.file_paths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File Paths ({strings.file_paths.length})
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {strings.file_paths.map((path, idx) => (
                <div key={idx} className="p-2 bg-slate-900/50 rounded text-sm font-mono text-slate-300">
                  {path}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderCodeAnalysis = () => {
    if (!analysis?.code_analysis) {
      return <div className="text-center text-slate-400 py-12">No code analysis data available</div>
    }

    const code = analysis.code_analysis

    return (
      <div className="space-y-6">
        {/* Code Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Code} label="Functions" value={code.total_functions} color="text-purple-500" />
          <StatCard icon={Terminal} label="Variables" value={code.total_variables} color="text-cyan-500" />
          <StatCard icon={AlertTriangle} label="Suspicious Vars" value={code.suspicious_variables} color="text-red-500" />
          <StatCard icon={Activity} label="Complexity" value={code.complexity_metrics.estimated_complexity} color="text-yellow-500" />
        </div>

        {/* Complexity Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Complexity Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard label="Complexity Score" value={code.complexity_metrics.estimated_complexity} />
            <MetricCard label="Complexity Rating" value={code.complexity_metrics.complexity_rating.toUpperCase()} />
            <MetricCard label="Control Branches" value={code.control_flow.total_branches} />
            <MetricCard label="Conditionals" value={code.control_flow.conditionals} />
            <MetricCard label="Loops" value={code.control_flow.loops} />
            <MetricCard label="Language" value={code.language} />
          </div>
        </motion.div>

        {/* Functions */}
        {code.functions_detected && code.functions_detected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Detected Functions ({code.functions_detected.length})
            </h3>
            <div className="space-y-2">
              {code.functions_detected.map((func, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div>
                    <span className="text-cyan-300 font-mono">{func.name}()</span>
                    <span className="text-slate-500 text-sm ml-3">Line {func.line_start}</span>
                  </div>
                  <span className="text-slate-400 text-sm">{func.lines} lines</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Variables */}
        {code.variables && code.variables.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Detected Variables ({code.variables.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {code.variables.map((variable, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border",
                    variable.suspicious
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-slate-900/50 border-slate-700/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-300 font-mono font-semibold">${variable.name}</span>
                        {variable.suspicious && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm font-mono truncate">{variable.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Code Smells */}
        {code.code_smells && code.code_smells.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 border border-yellow-500/30 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Code Smells ({code.code_smells.length})
            </h3>
            <div className="space-y-2">
              {code.code_smells.map((smell, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-300 text-sm">{smell}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderMitre = () => {
    if (!analysis?.mitre_attack || !analysis.mitre_attack.tactics) {
      return <div className="text-center text-slate-400 py-12">No MITRE ATT&CK data available</div>
    }

    const mitre = analysis.mitre_attack

    return (
      <div className="space-y-6">
        {/* MITRE Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Tactics" value={mitre.total_tactics} color="text-green-500" />
          <StatCard icon={Activity} label="Techniques" value={mitre.total_techniques} color="text-blue-500" />
          <StatCard
            icon={Shield}
            label="Complexity"
            value={mitre.attack_complexity.toUpperCase()}
            color="text-yellow-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Coverage"
            value={`${Object.values(mitre.coverage_matrix).filter(Boolean).length}/12`}
            color="text-purple-500"
          />
        </div>

        {/* Tactics & Techniques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            MITRE ATT&CK Tactics & Techniques
          </h3>
          {mitre.tactics.map((tactic, idx) => (
            <motion.div
              key={tactic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-sm font-semibold">
                    {tactic.id}
                  </span>
                  <h4 className="text-white font-semibold text-lg">{tactic.name}</h4>
                  <span className="text-slate-500 text-sm">
                    ({tactic.techniques.length} technique{tactic.techniques.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tactic.techniques.map((technique) => (
                    <div
                      key={technique.id}
                      className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded"
                    >
                      <span className="text-xs font-mono text-blue-400">{technique.id}</span>
                      <span className="text-sm text-blue-200">{technique.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Coverage Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Coverage Matrix
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(mitre.coverage_matrix).map(([key, covered]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border",
                  covered
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-slate-900/50 border-slate-700/30"
                )}
              >
                {covered ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
                <span className={cn(
                  "text-sm capitalize",
                  covered ? "text-green-300" : "text-slate-500"
                )}>
                  {key.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Analyzing file...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !selectedFile?.analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Analysis Failed</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/stata-files')}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Return to File Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/stata-files')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Files</span>
            </button>

            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyan-500" />
              <div>
                <h1 className="text-white font-bold">STATA Analysis</h1>
                <p className="text-slate-400 text-sm">{selectedFile?.name || 'File Analysis'}</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={false}
            animate={{
              width: sidebarOpen ? '16rem' : '0rem',
              opacity: sidebarOpen ? 1 : 0
            }}
            className="hidden md:block sticky top-24 h-fit"
          >
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    activeSection === section.id
                      ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-800/50 border border-transparent"
                  )}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </nav>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'overview' && renderOverview()}
                {activeSection === 'threats' && renderThreats()}
                {activeSection === 'behavior' && renderBehavior()}
                {activeSection === 'network' && renderNetwork()}
                {activeSection === 'commands' && renderCommands()}
                {activeSection === 'hashes' && renderHashes()}
                {activeSection === 'code' && renderCodeAnalysis()}
                {activeSection === 'mitre' && renderMitre()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Fixed Tab Selector - Mobile */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 p-4 z-40">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all",
                      activeSection === section.id
                        ? "bg-cyan-500/20 border border-cyan-500/30"
                        : "border border-transparent opacity-60"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      activeSection === section.id ? "text-cyan-300" : "text-slate-400"
                    )} />
                    <span className={cn(
                      "text-xs",
                      activeSection === section.id ? "text-cyan-300" : "text-slate-400"
                    )}>
                      {section.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-slate-400 text-sm">{label}</p>
    </motion.div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white text-lg font-semibold">{value}</p>
    </div>
  )
}

function ImpactCard({ label, value }: { label: string; value: string }) {
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30'
      case 'none': return 'text-green-500 bg-green-500/10 border-green-500/30'
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/30'
    }
  }

  return (
    <div className={cn("rounded-lg p-4 border", getImpactColor(value))}>
      <p className="text-xs mb-1 opacity-80">{label}</p>
      <p className="text-lg font-semibold capitalize">{value}</p>
    </div>
  )
}
