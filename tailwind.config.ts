import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          base: 'var(--bg-base)',
          surface: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          action: 'var(--surface-action)',
          border: 'var(--border)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent)',
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)'
        }
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'var(--font-body)', 'Noto Sans Thai', 'sans-serif'],
        body: ['var(--font-body)', 'Noto Sans Thai', 'sans-serif']
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        elevated: 'var(--shadow-elevated)'
      }
    }
  },
  plugins: []
};

export default config;
