import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#1B1E22",
          alt: "#22262B",
          light: "#2E3339",
        },
        ink: {
          DEFAULT: "#EDEEF0",
          dim: "#9AA0A6",
          dimmer: "#6A6F76",
        },
        accent: {
          DEFAULT: "#FF6A1A",
          dim: "#C6551A",
          light: "#FF7F3D",
        },
        steel: "#7FA6C9",
        line: {
          DEFAULT: "#383D44",
          soft: "#2C3036",
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
