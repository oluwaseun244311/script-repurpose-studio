/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 60%, #06b6d4 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.12) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(124,58,237,0.25)',
        'glow': '0 0 28px rgba(124,58,237,0.4)',
        'glow-blue': '0 0 24px rgba(37,99,235,0.35)',
        'card': '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.25)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-glow': { '0%,100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
      },
      animation: {
        'fade-up': 'fade-up 0.22s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
