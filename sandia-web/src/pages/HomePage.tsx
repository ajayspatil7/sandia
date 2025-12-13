import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Upload,
  BarChart3,
  Brain,
  Zap,
  Lock,
  Eye,
  Activity,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import SciFiBackground from '../components/SciFiBackground'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced threat detection using machine learning algorithms',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: Lock,
      title: 'Secure Sandbox',
      description: 'Isolated analysis environment with complete security',
      color: 'from-primary-500 to-primary-500'
    },
    {
      icon: Eye,
      title: 'Real-time Monitoring',
      description: 'Live threat assessment and behavioral analysis',
      color: 'from-primary-500 to-primary-500'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Fast processing with immediate threat classification',
      color: 'from-primary-400 to-primary-500'
    }
  ]

  const stats = [
    { label: 'Files Analyzed', value: '2,847', icon: FileText },
    { label: 'Threats Detected', value: '156', icon: AlertTriangle },
    { label: 'Clean Files', value: '2,691', icon: CheckCircle },
    { label: 'Success Rate', value: '99.8%', icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-950 sci-fi-background">
      {/* Sci-Fi Background */}
      <SciFiBackground />

      {/* Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex justify-between items-center px-6 py-4"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary-200 glow-matrix" />
            <div className="absolute inset-0 w-8 h-8 text-primary-200 animate-primary-glow opacity-50"></div>
          </div>
          <span className="text-2xl font-bold text-primary-200 text-brand font-tactical">SANDIA</span>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/analyze')}
            className="btn-secondary"
          >
            UPLOAD FILES
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            DASHBOARD
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-24 h-24 mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <div className="relative w-full h-full bg-dark-900 rounded-full flex items-center justify-center m-1">
                <Shield className="w-12 h-12 text-primary-200" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 heading-primary">
              <span className="text-primary-200">SANDIA</span>{' '}
              <span className="text-primary-400">CYBERSECURITY</span>
            </h1>

            <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto text-body font-cyber">
              AI-POWERED CYBERSECURITY ANALYSIS PLATFORM COMBINING MACHINE LEARNING
              WITH SECURE VIRTUALIZED ENVIRONMENTS FOR COMPREHENSIVE THREAT DETECTION
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/analyze')}
                className="btn-primary text-lg py-4 px-8 group"
              >
                START ANALYSIS
                <Upload className="w-5 h-5 ml-2 group-hover:animate-pulse" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="btn-secondary text-lg py-4 px-8 group"
              >
                VIEW DASHBOARD
                <BarChart3 className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="card-tactical rounded-sm p-6 text-center hover-tactical"
              >
                <div className="w-12 h-12 mx-auto mb-4 p-2 bg-primary-600/20 rounded-sm glow-matrix">
                  <stat.icon className="w-8 h-8 text-primary-200" />
                </div>
                <div className="text-3xl font-bold text-primary-200 mb-2 heading-primary font-tactical">
                  {stat.value}
                </div>
                <div className="text-sm text-dark-400 text-body font-cyber">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary-200 mb-4 heading-primary">
                ADVANCED SECURITY FEATURES
              </h2>
              <p className="text-xl text-dark-300 max-w-2xl mx-auto text-body font-cyber">
                CUTTING-EDGE TECHNOLOGY FOR COMPREHENSIVE CYBERSECURITY ANALYSIS
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="card-tactical rounded-sm p-8 group hover:border-primary-500/50 transition-all duration-300 hover-tactical"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-0.5 flex-shrink-0`}>
                      <div className="w-full h-full bg-dark-900 rounded-sm flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary-200 mb-2 heading-secondary font-tactical">
                        {feature.title.toUpperCase()}
                      </h3>
                      <p className="text-dark-400 text-body font-cyber">
                        {feature.description.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="card-tactical rounded-sm p-12 text-center hover-tactical"
          >
            <h2 className="text-3xl font-bold text-primary-200 mb-4 heading-primary">
              READY TO SECURE YOUR FILES?
            </h2>
            <p className="text-lg text-dark-300 mb-8 text-body font-cyber">
              UPLOAD YOUR FILES AND GET INSTANT AI-POWERED THREAT ANALYSIS
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/analyze')}
              className="btn-primary text-lg py-4 px-8 group"
            >
              GET STARTED NOW
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HomePage