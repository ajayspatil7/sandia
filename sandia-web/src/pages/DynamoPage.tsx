import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Activity,
  Monitor,
  Network,
  Cpu,
  ArrowLeft,
  Construction,
  Zap
} from 'lucide-react'

export default function DynamoPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Play,
      title: 'Sandbox Execution',
      description: 'Execute files in isolated virtual environments'
    },
    {
      icon: Network,
      title: 'Network Monitoring',
      description: 'Real-time network activity and traffic analysis'
    },
    {
      icon: Monitor,
      title: 'System Call Tracing',
      description: 'Monitor all system interactions and API calls'
    },
    {
      icon: Activity,
      title: 'Behavioral Analysis',
      description: 'Live behavioral pattern detection and analysis'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 py-12"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate('/dashboard')}
          className="mb-8 flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard Selection</span>
        </motion.button>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-orange-600/20 to-red-500/20 px-8 py-6 rounded-2xl border border-orange-400/30 mb-6">
              <Play className="w-12 h-12 text-orange-400" />
              <div className="text-left">
                <h1 className="text-4xl font-bold text-white font-tactical">
                  DYNAMO
                </h1>
                <p className="text-orange-300 text-lg font-medium">
                  Dynamic Analysis Engine
                </p>
              </div>
            </div>
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-dark-800/50 rounded-2xl p-12 border border-orange-400/20 mb-12"
          >
            <Construction className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4 font-tactical">
              Welcome to DYNAMO
            </h2>
            <p className="text-dark-300 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
              The dynamic analysis engine is currently under development. This powerful system will provide
              real-time malware analysis in secure sandbox environments with comprehensive behavioral monitoring.
            </p>
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Coming Soon</span>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-primary-200 mb-8 font-tactical">
              Planned Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="bg-dark-800/30 rounded-xl p-6 border border-primary-200/10"
                  >
                    <Icon className="w-8 h-8 text-orange-400 mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-dark-400 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Development Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-r from-primary-600/10 to-orange-500/10 rounded-2xl p-8 border border-primary-400/20"
          >
            <h3 className="text-xl font-bold text-primary-200 mb-4">
              Development Status
            </h3>
            <p className="text-dark-300">
              DYNAMO is being built with cutting-edge sandbox technology and AI-powered behavioral analysis.
              Stay tuned for updates on the dynamic analysis capabilities that will complement STATA's static analysis features.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}