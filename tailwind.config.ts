import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0D0F12",
          alt: "#13161B",
          card: "#171A21",
          light: "#1E222B",
          surface: "#111418",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          muted: "#E5E7EB",
          dim: "#9CA3AF",
          dimmer: "#6B7280",
        },
        accent: {
          DEFAULT: "#FF6A1A",
          hover: "#FF5500",
          dim: "#D4520B",
          light: "#FF8038",
          glow: "rgba(255, 106, 26, 0.25)",
        },
        steel: "#8BA2B8",
        line: {
          DEFAULT: "#252932",
          soft: "#1C1F26",
          bright: "#353A47",
        },
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
