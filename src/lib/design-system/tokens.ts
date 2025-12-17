/**
 * Design System Tokens
 * 
 * Centralized design tokens for the blog design system.
 * These values should match the CSS custom properties in tokens.css
 */

export const tokens = {
	colors: {
		// Backgrounds
		bg: {
			primary: '#e1e1e1',
			hero: '#000000',
			content: '#000000',
		},
		// Text
		text: {
			primary: '#1a1a1a',
			secondary: '#525252',
			light: '#ffffff',
			onDark: '#F3F2F1',
			bodyDark: '#E0DDD9',
		},
		// Accent
		accent: {
			base: '#0e8b3e',
			hover: '#0a6b2e',
		},
		// Tags
		tag: {
			orange: '#e59d50',
			green: '#9ecf5a',
			blue: '#4590b3',
			purple: '#9d7bdd',
		},
		// Neutral
		neutral: {
			300: '#d4d4d4',
			400: '#a3a3a3',
			500: '#737373',
			600: '#525252',
		},
	},
	
	typography: {
		fonts: {
			sans: '"Inter", sans-serif',
			serif: '"Libre Caslon Text", "Georgia", serif',
			handwritten: '"Delicious Handrawn", cursive',
		},
		sizes: {
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
			'5xl': '3rem',
			'6xl': '3.75rem',
			'7xl': '4.5rem',
			'8xl': '6rem',
			'9xl': '8rem',
		},
		weights: {
			light: '300',
			normal: '400',
			bold: '700',
		},
		lineHeights: {
			tight: '1.1',
			snug: '1.25',
			normal: '1.5',
			relaxed: '1.75',
			loose: '2',
		},
	},
	
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
		'2xl': '3rem',
		'3xl': '4rem',
		'4xl': '6rem',
	},
	
	breakpoints: {
		sm: '640px',
		md: '768px',
		lg: '1024px',
		xl: '1280px',
		'2xl': '1536px',
	},
	
	borderRadius: {
		none: '0',
		sm: '0.125rem',
		md: '0.375rem',
		lg: '0.5rem',
		xl: '0.75rem',
		full: '9999px',
	},
	
	shadows: {
		sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
		lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
	},
	
	transitions: {
		fast: '0.15s ease',
		base: '0.2s ease',
		slow: '0.3s ease',
	},
} as const;

/**
 * Tag color palette array for easy rotation
 */
export const tagColors = [
	tokens.colors.tag.orange,
	tokens.colors.tag.green,
	tokens.colors.tag.blue,
	tokens.colors.tag.purple,
] as const;

/**
 * Sketch path variations for organic tag pill shapes
 */
export const sketchPaths = [
	// Rounded blob - organic shape
	"M 15 50 Q 5 40 8 25 Q 12 8 30 5 Q 50 2 70 5 Q 88 8 92 25 Q 95 40 85 50 Q 75 60 70 62 Q 50 65 30 62 Q 15 60 15 50 Z",
	// Slightly tilted ellipse
	"M 12 45 Q 3 30 10 18 Q 20 5 50 4 Q 80 5 90 18 Q 97 30 88 45 Q 80 58 50 60 Q 20 58 12 45 Z",
	// Wavy blob
	"M 10 40 Q 5 25 15 12 Q 30 2 50 5 Q 75 2 88 15 Q 95 30 90 45 Q 82 58 60 62 Q 35 65 18 55 Q 8 48 10 40 Z",
	// Squished organic
	"M 8 48 Q 2 35 12 20 Q 25 5 50 3 Q 78 5 90 20 Q 98 38 92 50 Q 82 62 55 63 Q 25 62 12 52 Q 5 48 8 48 Z",
] as const;
