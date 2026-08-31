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
        // Semantic tokens, wired to the CSS variables in globals.css.
        //
        // The variables already existed but were never mapped here, so
        // shadcn-style utilities — bg-background, text-muted-foreground,
        // border-border, text-destructive — resolved to nothing at all. Classes
        // that silently do nothing are worse than ones that error: a dropped-in
        // component renders, just unstyled, and it is not obvious why.
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
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
        // Retuned from the old blue navy to a true neutral near-black. The
        // scale keeps its `navy-*` names because 160-odd class names across the
        // site refer to it; renaming them would be a large diff that changes
        // nothing you can see. The blue is what made the old palette fight the
        // orange — neutral greys let one accent read as the only accent.
        navy: {
          950: "#09090B",
          900: "#0F0F12",
          850: "#18181B",
          800: "#1F1F23",
          700: "#27272A",
          600: "#3F3F46",
        },
        // Ambient light only — glows, gradient washes, decorative strokes.
        // Never a button, never a link: those are always AWS orange, so the
        // one colour that means "you can act on this" stays unambiguous.
        ambient: {
          indigo: "#6366F1",
          violet: "#A78BFA",
          plum: "#C084FC",
        },
        cyber: {
          dark: "#09090B",
          card: "rgba(24, 24, 27, 0.7)",
          "card-hover": "rgba(39, 39, 42, 0.85)",
          border: "rgba(255, 255, 255, 0.08)",
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
        "cyber-grid": "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
        "hero-glow": "radial-gradient(600px circle at center, rgba(255, 153, 0, 0.12), transparent 70%)",
        "ambient-glow": "radial-gradient(900px circle at 50% 0%, rgba(99, 102, 241, 0.14), transparent 65%)",
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
