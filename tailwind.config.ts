import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Dynamic animation classes for pattern display
    'animate-pulse8',
    'animate-strobe8', 
    'animate-wave8',
    'animate-fade8'
  ],
  theme: {
  	extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			/* Concert Finder Pattern Colors */
  			magenta: {
  				DEFAULT: 'hsl(var(--magenta))',
  				foreground: 'hsl(var(--magenta-foreground))'
  			},
  			cyan: {
  				DEFAULT: 'hsl(var(--cyan))',
  				foreground: 'hsl(var(--cyan-foreground))'
  			},
  			lime: {
  				DEFAULT: 'hsl(var(--lime))',
  				foreground: 'hsl(var(--lime-foreground))'
  			},
  			amber: {
  				DEFAULT: 'hsl(var(--amber))',
  				foreground: 'hsl(var(--amber-foreground))'
  			},
  			violet: {
  				DEFAULT: 'hsl(var(--violet))',
  				foreground: 'hsl(var(--violet-foreground))'
  			},
  			glass: 'hsl(var(--glass))'
  		},
  		borderRadius: {
  			lg: '2px',
  			md: '2px', 
  			sm: '2px',
        none: '0px'
  		},
      textShadow: {
        neon: '0 0 12px currentColor, 0 0 24px currentColor',
      },
      boxShadow: {
        neon: '0 0 16px currentColor, 0 0 32px currentColor',
      },
      spacing: {
        '0': '0px',
        '0.5': '4px',  // Half unit for fine adjustments
        '1': '8px',    // Base unit
        '1.5': '12px',
        '2': '16px', 
        '2.5': '20px',
        '3': '24px',
        '3.5': '28px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
        '9': '72px',
        '10': '80px',
        '11': '88px',
        '12': '96px',
        '14': '112px',
        '16': '128px',
        '20': '160px',
        '24': '192px',
        '28': '224px',
        '32': '256px',
        '36': '288px',
        '40': '320px',
        '44': '352px',
        '48': '384px',
        '52': '416px',
        '56': '448px',
        '60': '480px',
        '64': '512px',
        '72': '576px',
        '80': '640px',
        '96': '768px',
      },
  		animation: {
  			'pulse8': 'pulse8 600ms steps(4, end) infinite',
  			'strobe8': 'strobe8 140ms steps(2, end) infinite',
  			'wave8': 'wave8 1200ms steps(8, end) infinite',
  			'fade8': 'pulse8 600ms steps(4, end) infinite', // Use pulse keyframes for fade
  		},
  		keyframes: {
  			pulse8: {
  				'0%, 100%': { opacity: '0.25' },
  				'50%': { opacity: '1' }
  			},
  			strobe8: {
  				'0%': { opacity: '1' },
  				'50%': { opacity: '0' }
  			},
  			wave8: {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' }
  			}
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwindcss-textshadow")
  ],
} satisfies Config;
