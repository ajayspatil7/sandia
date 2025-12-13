import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface FloatingNode {
  id: number
  left: number
  delay: number
  duration: number
  size: number
}

interface CircuitLine {
  id: number
  top: number
  width: number
  delay: number
  duration: number
}

const SciFiBackground = () => {
  const [nodes, setNodes] = useState<FloatingNode[]>([])
  const [circuits, setCircuits] = useState<CircuitLine[]>([])

  useEffect(() => {
    // Generate floating nodes
    const generateNodes = () => {
      const newNodes: FloatingNode[] = []
      for (let i = 0; i < 12; i++) {
        newNodes.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 15,
          duration: 15 + Math.random() * 10,
          size: 2 + Math.random() * 3
        })
      }
      setNodes(newNodes)
    }

    // Generate circuit lines
    const generateCircuits = () => {
      const newCircuits: CircuitLine[] = []
      for (let i = 0; i < 6; i++) {
        newCircuits.push({
          id: i,
          top: Math.random() * 100,
          width: 200 + Math.random() * 400,
          delay: Math.random() * 8,
          duration: 8 + Math.random() * 4
        })
      }
      setCircuits(newCircuits)
    }

    generateNodes()
    generateCircuits()

    // Regenerate periodically for variety
    const interval = setInterval(() => {
      generateNodes()
      generateCircuits()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Main sci-fi background pattern */}
      <div className="absolute inset-0 sci-fi-background opacity-60"></div>

      {/* Floating data nodes */}
      <div className="data-nodes">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="floating-node"
            style={{
              left: `${node.left}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
              y: '-10vh',
              x: [0, 20, -10, 15, 0],
              opacity: [0, 1, 1, 1, 0]
            }}
            transition={{
              duration: node.duration,
              delay: node.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Circuit flow lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {circuits.map((circuit) => (
          <motion.div
            key={circuit.id}
            className="circuit-line"
            style={{
              top: `${circuit.top}%`,
              width: `${circuit.width}px`,
            }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{
              x: '100vw',
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: circuit.duration,
              delay: circuit.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Corner accent elements */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-secondary-400/20"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-primary-400/20"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-accent-400/20"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-secondary-400/20"></div>

      {/* Subtle data visualization elements */}
      <motion.div
        className="absolute top-1/4 right-20 opacity-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <svg width="120" height="80" viewBox="0 0 120 80">
          <path
            d="M10,70 Q30,20 50,40 T90,30 L110,50"
            stroke="rgba(6, 182, 212, 0.3)"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="30" cy="35" r="2" fill="rgba(34, 197, 94, 0.4)" />
          <circle cx="70" cy="45" r="2" fill="rgba(29, 78, 216, 0.4)" />
          <circle cx="90" cy="30" r="2" fill="rgba(6, 182, 212, 0.4)" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-20 opacity-10"
        animate={{
          rotate: [0, 360],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon
            points="50,10 90,30 90,70 50,90 10,70 10,30"
            stroke="rgba(34, 197, 94, 0.2)"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="50" cy="50" r="15" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" fill="none" />
        </svg>
      </motion.div>
    </>
  )
}

export default SciFiBackground