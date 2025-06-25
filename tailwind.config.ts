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
        // Couleurs principales du thème musical moderne
        background: "#1C1C2E",
        foreground: "#F1F1F1",
        
        // Palette de couleurs personnalisée
        'night-blue': '#1C1C2E',
        'peach-soft': '#F2A365',
        'blue-gray-cold': '#3E5C76',
        'gold-soft': '#D9BF77',
        'text-primary': '#F1F1F1',
        'text-secondary': '#B8B8B8',
        'text-muted': '#8A8A8A',
        
        // Surfaces et élévations
        'surface-elevated': '#242438',
        'surface-card': '#2A2A40',
        
        // États et interactions
        'accent': {
          primary: '#F2A365',
          secondary: '#3E5C76',
          highlight: '#D9BF77',
        }
      },
      
      // Gradients personnalisés
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F2A365, #D9BF77)',
        'gradient-surface': 'linear-gradient(135deg, #242438, #2A2A40)',
        'gradient-overlay': 'linear-gradient(180deg, transparent, rgba(28, 28, 46, 0.8))',
        'gradient-night': 'linear-gradient(135deg, #1C1C2E, #242438, #2A2A40)',
      },
      
      // Box shadows personnalisées
      boxShadow: {
        'soft': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'strong': '0 16px 64px rgba(0, 0, 0, 0.5)',
        'accent': '0 4px 16px rgba(242, 163, 101, 0.3)',
        'accent-strong': '0 8px 32px rgba(242, 163, 101, 0.4)',
      },
      
      // Animations personnalisées
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
        shimmer: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        pulseSoft: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
      },
      
      // Espacements et tailles
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Border radius personnalisés
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Typography
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
      },
      
      // Backdrop blur
      backdropBlur: {
        '4xl': '72px',
      },
    },
  },
  plugins: [],
};

export default config;
