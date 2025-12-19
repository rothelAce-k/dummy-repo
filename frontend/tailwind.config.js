/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B0F19", // Deep Space
          secondary: "#111827", // Card BG
          tertiary: "#1F2937", // Lighter BG
        },
        primary: {
          DEFAULT: "#3B82F6", // Neon Blue
          hover: "#2563EB",
          light: "rgba(59, 130, 246, 0.1)",
        },
        secondary: {
          DEFAULT: "#8B5CF6", // Purple
          hover: "#7C3AED",
          light: "rgba(139, 92, 246, 0.1)",
        },
        success: {
          DEFAULT: "#10B981", // Emerald
          light: "rgba(16, 185, 129, 0.1)",
        },
        warning: {
          DEFAULT: "#F59E0B", // Amber
          light: "rgba(245, 158, 11, 0.1)",
        },
        danger: {
          DEFAULT: "#EF4444", // Red
          light: "rgba(239, 68, 68, 0.1)",
        },
        surface: {
          DEFAULT: "rgba(31, 41, 55, 0.7)", // Glass base
          hover: "rgba(55, 65, 81, 0.7)",
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 10px -10px rgba(59, 130, 246, 0.5)' },
          'to': { boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.5)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a2a2a 0deg, #1a1a1a 50%, #2a2a2a 100%)',
      }
    },
  },
  plugins: [],
}
