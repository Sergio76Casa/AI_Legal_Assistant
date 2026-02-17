/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#F9FAFB', // Blanco Crudo
                primary: {
                    DEFAULT: '#064E3B', // Verde Esmeralda Profundo
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: '#D4AF37', // Dorado Suave
                    foreground: '#111827',
                },
                muted: {
                    DEFAULT: '#F3F4F6',
                    foreground: '#6B7280',
                },
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}
