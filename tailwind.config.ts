import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    // Breakpoints optimisés pour tous les appareils
    screens: {
      'xs': '475px',      // Petits mobiles
      'sm': '640px',      // Mobiles large
      'md': '768px',      // Tablettes portrait
      'lg': '1024px',     // Tablettes paysage / petits desktop
      'xl': '1280px',     // Desktop standard
      '2xl': '1536px',    // Grand desktop
      '3xl': '1920px',    // Full HD
      '4xl': '2560px',    // 2K/4K
    },
    extend: {
      // Typographie fluide avec clamp() - s'adapte automatiquement
      fontSize: {
        // Format: [clamp(min, fluid, max), lineHeight]
        'xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
        'sm': ['clamp(0.875rem, 0.8rem + 0.35vw, 1rem)', { lineHeight: '1.5' }],
        'base': ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', { lineHeight: '1.75' }],
        'lg': ['clamp(1.125rem, 1rem + 0.5vw, 1.25rem)', { lineHeight: '1.75' }],
        'xl': ['clamp(1.25rem, 1.1rem + 0.65vw, 1.5rem)', { lineHeight: '1.75' }],
        '2xl': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { lineHeight: '1.4' }],
        '3xl': ['clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)', { lineHeight: '1.3' }],
        '4xl': ['clamp(2.25rem, 1.8rem + 2vw, 3rem)', { lineHeight: '1.2' }],
        '5xl': ['clamp(3rem, 2.2rem + 3vw, 4rem)', { lineHeight: '1.1' }],
        '6xl': ['clamp(3.75rem, 2.5rem + 5vw, 5rem)', { lineHeight: '1' }],
        '7xl': ['clamp(4.5rem, 3rem + 6vw, 6rem)', { lineHeight: '1' }],
        '8xl': ['clamp(6rem, 4rem + 8vw, 8rem)', { lineHeight: '1' }],
        '9xl': ['clamp(8rem, 5rem + 10vw, 10rem)', { lineHeight: '1' }],
      },
      // Espacements fluides
      spacing: {
        'fluid-xs': 'clamp(0.5rem, 1vw, 1rem)',
        'fluid-sm': 'clamp(1rem, 2vw, 2rem)',
        'fluid-md': 'clamp(2rem, 4vw, 4rem)',
        'fluid-lg': 'clamp(3rem, 6vw, 6rem)',
        'fluid-xl': 'clamp(4rem, 8vw, 8rem)',
        'fluid-2xl': 'clamp(6rem, 12vw, 12rem)',
      },
      // Largeurs de container adaptatives
      maxWidth: {
        'container-xs': '100%',
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1536px',
        'container-3xl': '1920px',
      },
      colors: {
        // Charte graphique AGRI POINT
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#1B5E20', // Vert profond - Couleur principale
          700: '#155017',
          800: '#0f3e11',
          900: '#0a2c0c',
        },
        secondary: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336',
          600: '#B71C1C', // Rouge terre - Couleur secondaire
          700: '#8e1616',
          800: '#651010',
          900: '#3c0a0a',
        },
        accent: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e', // Beige
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        // Polices modernes et élégantes
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
