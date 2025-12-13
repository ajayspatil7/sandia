/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional cybersecurity blue theme matching reference image
        primary: {
          50: '#f0f6ff',
          100: '#e0edfa',
          200: '#cbdffa',  // (203, 224, 250) - Main reference color
          300: '#9cc5f7',
          400: '#6ba5f0',
          500: '#4284e8',
          600: '#2c67d6',
          700: '#2451b5',
          800: '#234194',
          900: '#213677',
          950: '#152047',
        },
        // Dark background colors for sci-fi aesthetic
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',  // Main dark background
          900: '#0f172a',  // Darker panels
          950: '#020617',  // Darkest elements
        },
        // Accent colors for highlights and status
        accent: {
          cyan: '#22d3ee',
          blue: '#3b82f6',
          indigo: '#6366f1',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          orange: '#f97316',
        },
        // Status colors matching cybersecurity theme
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          critical: '#dc2626',
          secure: '#059669',
        },
        // Specialized cybersecurity colors
        cyber: {
          matrix: '#00ff41',     // Classic matrix green
          terminal: '#00d4aa',   // Terminal cyan
          warning: '#fbbf24',    // Warning amber
          critical: '#f87171',   // Critical red
          safe: '#34d399',       // Safe green
          scan: '#60a5fa',       // Scanning blue
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'clean': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}