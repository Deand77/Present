import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4F1EA",
        ink: "#2A2724",
        muted: "#6E6962",
        accent: "#B85C38",
        line: "#E4DFD4",
      },
      fontFamily: {
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
