import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        // Add fallback colors here for border and others
        border: "var(--border, #e5e7eb)", // fallback light gray
        input: "var(--input, #f9fafb)", // example fallback
        ring: "var(--ring, #2563eb)", // example fallback (blue)
        chart: {
          "1": "var(--chart-1, #3b82f6)",
          "2": "var(--chart-2, #10b981)",
          "3": "var(--chart-3, #f59e0b)",
          "4": "var(--chart-4, #ef4444)",
          "5": "var(--chart-5, #8b5cf6)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background, #1f2937)",
          foreground: "var(--sidebar-foreground, #d1d5db)",
          primary: "var(--sidebar-primary, #3b82f6)",
          "primary-foreground": "var(--sidebar-primary-foreground, #ffffff)",
          accent: "var(--sidebar-accent, #10b981)",
          "accent-foreground": "var(--sidebar-accent-foreground, #ffffff)",
          border: "var(--sidebar-border, #374151)",
          ring: "var(--sidebar-ring, #2563eb)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
