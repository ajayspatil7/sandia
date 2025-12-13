import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Activity,
  Brain,
  Zap,
  ArrowRight,
  FileSearch,
  Play
} from 'lucide-react'

export default function DashboardSelectionPage() {
  const navigate = useNavigate()

  const dashboards = [
    {
      id: 'stata',
      title: 'STATA',
      subtitle: 'Static Analysis',
      description: 'Comprehensive static analysis with AI-powered threat assessment. Analyze file metadata, strings, behaviors, and threat indicators without execution.',
      icon: FileSearch,
      color: 'from-primary-600/20 to-primary-500/20',
      borderColor: 'border-primary-400/30',
      iconColor: 'text-primary-400',
      features: ['File Metadata Analysis', 'String & Pattern Detection', 'Behavioral Prediction', 'Threat Classification'],
      route: '/stata-files'
    },
    {
      id: 'dynamo',
      title: 'DYNAMO',
      subtitle: 'Dynamic Analysis',
      description: 'Real-time dynamic analysis in isolated sandbox environments. Monitor live execution, network activity, and system interactions.',
      icon: Play,
      color: 'from-orange-600/20 to-red-500/20',
      borderColor: 'border-orange-400/30',
      iconColor: 'text-orange-400',
      features: ['Sandbox Execution', 'Network Monitoring', 'System Call Tracing', 'Behavioral Analysis'],
      route: '/dynamo',
      comingSoon: true
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
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-600/20 to-primary-500/20 px-8 py-4 rounded-full border border-primary-400/30 mb-6"
          >
            <Shield className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl font-bold text-primary-200 font-tactical">
              SANDIA DASHBOARD
            </h1>
          </motion.div>
          <p className="text-dark-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Choose your analysis approach. Static analysis for comprehensive threat assessment or dynamic analysis for real-time behavior monitoring.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {dashboards.map((dashboard, index) => {
            const Icon = dashboard.icon
            return (
              <motion.div
                key={dashboard.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                className="group relative"
              >
                <div className={`
                  relative bg-gradient-to-br ${dashboard.color} p-8 rounded-2xl
                  border ${dashboard.borderColor} backdrop-blur-sm
                  transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                  ${dashboard.comingSoon ? 'opacity-75' : 'hover:shadow-primary-500/20'}
                `}>
                  {/* Coming Soon Badge */}
                  {dashboard.comingSoon && (
                    <div className="absolute -top-3 -right-3 bg-orange-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Coming Soon
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 bg-dark-800/50 rounded-xl ${dashboard.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white font-tactical mb-1">
                          {dashboard.title}
                        </h2>
                        <p className="text-dark-300 font-medium">
                          {dashboard.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`
                      w-6 h-6 ${dashboard.iconColor} opacity-0
                      group-hover:opacity-100 group-hover:translate-x-2
                      transition-all duration-300
                    `} />
                  </div>

                  {/* Description */}
                  <p className="text-dark-200 leading-relaxed mb-6">
                    {dashboard.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <h4 className="text-sm font-medium text-dark-400 uppercase tracking-wide">
                      KEY FEATURES
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {dashboard.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${dashboard.iconColor.replace('text-', 'bg-')}`} />
                          <span className="text-sm text-dark-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(dashboard.route)}
                    disabled={dashboard.comingSoon}
                    className={`
                      w-full py-4 px-6 rounded-xl font-medium transition-all duration-300
                      ${dashboard.comingSoon
                        ? 'bg-dark-600/50 text-dark-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${dashboard.color} ${dashboard.borderColor} border text-white hover:shadow-lg hover:scale-[1.02]`
                      }
                    `}
                  >
                    {dashboard.comingSoon ? 'Coming Soon' : `Launch ${dashboard.title}`}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-dark-800/30 rounded-2xl p-8 max-w-4xl mx-auto border border-primary-200/10">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-primary-400" />
              <h3 className="text-lg font-medium text-primary-200">
                AI-Powered Analysis
              </h3>
            </div>
            <p className="text-dark-300 leading-relaxed">
              Both analysis engines are powered by advanced AI models that provide intelligent threat assessment,
              behavioral prediction, and comprehensive security insights to help you make informed decisions.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}