import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        aws: {
          orange: "#FF9900",
          "orange-light": "#FFA826",
          "orange-dark": "#EB8C00",
          amber: "#F59E0B",
          squid: "#232F3E",
          "squid-dark": "#131A22",
          smile: "#FF9900",
          blue: "#0073BB",
          "blue-light": "#1A90D9",
          cyan: "#00E5FF",
          purple: "#7928CA",
          pink: "#FF0080",
        },
        navy: {
          950: "#050811",
          900: "#080E1E",
          850: "#0C142B",
          800: "#111C3D",
          700: "#1E2F5E",
          600: "#2B4380",
        },
        cyber: {
          dark: "#050810",
          card: "rgba(12, 20, 43, 0.7)",
          "card-hover": "rgba(20, 32, 66, 0.85)",
          border: "rgba(255, 153, 0, 0.18)",
          "border-bright": "rgba(255, 153, 0, 0.45)",
          glow: "0 0 25px rgba(255, 153, 0, 0.25)",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "aws-gradient": "linear-gradient(135deg, #FF9900 0%, #FF5500 100%)",
        "cyber-grid": "linear-gradient(to right, rgba(255, 153, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 153, 0, 0.05) 1px, transparent 1px)",
        "hero-glow": "radial-gradient(600px circle at center, rgba(255, 153, 0, 0.12), transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 2s infinite",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spin-reverse 25s linear infinite",
        "glow-ping": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        }
      },
    },
  },
  plugins: [],
};

export default config;
