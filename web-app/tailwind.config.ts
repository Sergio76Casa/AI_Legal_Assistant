import type { Config } from "tailwindcss";

const config: Config = {
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
                purple: {
                    400: "#c084fc",
                    500: "#a855f7",
                    600: "#9333ea",
                },
                blue: {
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            animation: {
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(168, 85, 247, 0.2)" },
                    "100%": { boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)" },
                }
            }
        },
    },
    plugins: [],
};
export default config;
