import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Zap,
  Brain,
  Eye,
  Lock,
  Activity,
  ArrowRight,
  CheckCircle,
  Globe,
  Cpu,
  FileText
} from 'lucide-react'
import SciFiBackground from '../components/SciFiBackground'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-950 sci-fi-background">
      {/* Sci-Fi Background */}
      <SciFiBackground />

      {/* Additional ambient lighting */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-primary-300/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex justify-between items-center px-6 py-4"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary-200 glow-matrix" />
            <div className="absolute inset-0 w-8 h-8 text-primary-200 animate-cyber-glow opacity-50"></div>
          </div>
          <span className="text-2xl font-bold text-primary-200 text-brand font-tactical">SANDIA</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 font-medium font-cyber">FEATURES</a>
          <a href="#how-it-works" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 font-medium font-cyber">HOW IT WORKS</a>
          <a href="#security" className="text-dark-300 hover:text-primary-400 transition-colors duration-200 font-medium font-cyber">SECURITY</a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-24 h-24 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-primary-600/20 rounded-full glow-matrix"></div>
            <div className="relative w-full h-full bg-dark-800 rounded-full flex items-center justify-center border border-primary-700/30">
              <Brain className="w-12 h-12 text-primary-400" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight heading-primary">
            <span className="text-primary-400">AI-POWERED</span><br />
            <span className="text-primary-200">CYBERSECURITY ANALYSIS</span>
          </h1>

          <p className="text-xl md:text-2xl text-dark-300 mb-12 max-w-4xl mx-auto leading-relaxed text-body font-cyber">
            ADVANCED THREAT DETECTION USING STATE-OF-THE-ART AI AGENTS. UPLOAD ANY FILE AND GET COMPREHENSIVE
            STATIC & DYNAMIC ANALYSIS WITH ACTIONABLE INSIGHTS IN MINUTES.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/analyze')}
              className="btn-primary text-lg"
            >
              ANALYZE FILE NOW
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02 }}
              href="#how-it-works"
              className="btn-secondary text-lg"
            >
              LEARN MORE
            </motion.a>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
          >
            <div className="card-tactical p-6 hover-tactical">
              <div className="text-3xl font-bold text-primary-200 mb-2 font-tactical">99.7%</div>
              <div className="text-dark-300 text-body font-cyber">DETECTION ACCURACY</div>
            </div>
            <div className="card-tactical p-6 hover-tactical">
              <div className="text-3xl font-bold text-primary-400 mb-2 font-tactical">&lt;2MIN</div>
              <div className="text-dark-300 text-body font-cyber">ANALYSIS TIME</div>
            </div>
            <div className="card-tactical p-6 hover-tactical">
              <div className="text-3xl font-bold text-primary-400 mb-2 font-tactical">100%</div>
              <div className="text-dark-300 text-body font-cyber">CLOUD ISOLATION</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent to-void-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-secondary">
              <span className="text-primary-400">ADVANCED</span> ANALYSIS CAPABILITIES
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto text-body font-cyber">
              POWERED BY CUTTING-EDGE AI AND RUNNING IN ISOLATED CLOUD ENVIRONMENTS FOR MAXIMUM SECURITY
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: "Static Analysis",
                description: "Deep file inspection, string extraction, and behavior prediction without execution",
                color: "primary-500"
              },
              {
                icon: Activity,
                title: "Dynamic Analysis",
                description: "Real-time monitoring in isolated sandboxes to observe actual behavior",
                color: "primary-600"
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description: "Advanced LLM agents provide human-readable threat assessments and recommendations",
                color: "matrix-400"
              },
              {
                icon: Lock,
                title: "Complete Isolation",
                description: "Every analysis runs in a fresh, isolated cloud VM with golden snapshot restoration",
                color: "primary-500"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Get comprehensive analysis results in under 2 minutes with parallel processing",
                color: "cyber-400"
              },
              {
                icon: Globe,
                title: "Cloud Native",
                description: "Built on AWS infrastructure for unlimited scalability and global accessibility",
                color: "primary-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="card-tactical p-8 rounded-sm hover:shadow-lg hover:shadow-matrix-400/10 transition-all duration-300 hover-tactical"
              >
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}/20 flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary-200 heading-secondary font-tactical">{feature.title.toUpperCase()}</h3>
                <p className="text-dark-300 leading-relaxed text-body font-cyber">{feature.description.toUpperCase()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-secondary">
              HOW <span className="text-primary-200 text-brand font-tactical">SANDIA</span> WORKS
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto text-body font-cyber">
              SIMPLE UPLOAD, COMPREHENSIVE ANALYSIS, ACTIONABLE RESULTS
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Upload File",
                description: "Drag & drop any file type for analysis"
              },
              {
                step: "02",
                icon: Lock,
                title: "Secure Transfer",
                description: "File securely transferred to isolated VM"
              },
              {
                step: "03",
                icon: Cpu,
                title: "AI Analysis",
                description: "Advanced agents perform comprehensive analysis"
              },
              {
                step: "04",
                icon: CheckCircle,
                title: "Get Results",
                description: "Receive detailed threat assessment report"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto card-tactical rounded-full flex items-center justify-center mb-4 glow-matrix">
                    <step.icon className="w-8 h-8 text-primary-200" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary-200 heading-secondary font-tactical">{step.title.toUpperCase()}</h3>
                <p className="text-dark-300 text-sm text-body font-cyber">{step.description.toUpperCase()}</p>

                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-matrix-400/40 to-transparent -translate-y-1/2"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-primary-500/8 via-primary-600/8 to-matrix-400/8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-secondary">
            READY TO <span className="text-primary-400">ANALYZE</span>?
          </h2>
          <p className="text-xl text-dark-300 mb-12 max-w-2xl mx-auto text-body font-cyber">
            UPLOAD YOUR FIRST FILE AND EXPERIENCE THE POWER OF AI-DRIVEN CYBERSECURITY ANALYSIS
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/analyze')}
            className="btn-primary text-xl py-4 px-12 group"
          >
            START ANALYSIS
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-dark-700/30 bg-dark-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-primary-200" />
            <span className="text-xl font-bold text-primary-200 text-brand font-tactical">SANDIA</span>
          </div>
          <p className="text-dark-400 text-body font-cyber">
            ADVANCED AI-POWERED CYBERSECURITY ANALYSIS PLATFORM
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage