import type { Config } from "tailwindcss";

export default {
  // 👇 重点看这里：必须包含 ./src/...
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // 👈 确保排版插件也在
  ],
} satisfies Config;