// Client-side color extraction using canvas with WCAG contrast compliance
export interface ColorPalette {
	bgColor: string;
	textColor: string;
	headlineColor: string;
	headlineShadow: string;
	headlineAccent: string;
	tagColor: string;
	tagTextColor: string;
	borderColor: string;
	linkColor: string;
	isLight: boolean;
}

// Default green theme
export const defaultColors: ColorPalette = {
	bgColor: '#385c35',
	textColor: '#1a1a1a',
	headlineColor: '#4a8c3b',
	headlineShadow: '#2d5a25',
	headlineAccent: '#8fce7d',
	tagColor: '#4a8c3b',
	tagTextColor: '#1a1a1a',
	borderColor: '#4a8c3b',
	linkColor: '#3d7a30',
	isLight: false
};

// The actual background is always a grayish tone due to the texture overlay
// This is approximately what text is rendered against
const EFFECTIVE_BG: [number, number, number] = [160, 155, 150]; // Medium gray from texture

// Calculate relative luminance for WCAG contrast
function getRelativeLuminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map(c => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate WCAG contrast ratio between two colors
function getContrastRatio(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
	const l1 = getRelativeLuminance(r1, g1, b1);
	const l2 = getRelativeLuminance(r2, g2, b2);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

// Simple luminance for quick light/dark check
function getLuminance(r: number, g: number, b: number): number {
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Get saturation of a color (HSV saturation)
function getSaturation(r: number, g: number, b: number): number {
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	return max === 0 ? 0 : (max - min) / max;
}

// Darken a color
function darken(r: number, g: number, b: number, percent: number): [number, number, number] {
	return [
		Math.max(0, Math.floor(r * (1 - percent))),
		Math.max(0, Math.floor(g * (1 - percent))),
		Math.max(0, Math.floor(b * (1 - percent)))
	];
}

// Lighten a color
function lighten(r: number, g: number, b: number, percent: number): [number, number, number] {
	return [
		Math.min(255, Math.floor(r + (255 - r) * percent)),
		Math.min(255, Math.floor(g + (255 - g) * percent)),
		Math.min(255, Math.floor(b + (255 - b) * percent))
	];
}

// Boost saturation of a color
function saturate(r: number, g: number, b: number, amount: number): [number, number, number] {
	const avg = (r + g + b) / 3;
	return [
		Math.min(255, Math.max(0, Math.round(avg + (r - avg) * (1 + amount)))),
		Math.min(255, Math.max(0, Math.round(avg + (g - avg) * (1 + amount)))),
		Math.min(255, Math.max(0, Math.round(avg + (b - avg) * (1 + amount))))
	];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Ensure a color meets minimum contrast against the gray background
// by either lightening or darkening it
function ensureContrastOnGray(
	color: [number, number, number], 
	minContrast: number,
	preferLight: boolean = false
): [number, number, number] {
	let [r, g, b] = color;
	let contrast = getContrastRatio(r, g, b, ...EFFECTIVE_BG);
	
	if (contrast >= minContrast) {
		return [r, g, b];
	}
	
	// Try both directions and pick the one that reaches contrast faster
	let lightVersion: [number, number, number] = [r, g, b];
	let darkVersion: [number, number, number] = [r, g, b];
	
	// Lighten version
	for (let i = 0; i < 15; i++) {
		lightVersion = lighten(...lightVersion, 0.12);
		if (getContrastRatio(...lightVersion, ...EFFECTIVE_BG) >= minContrast) break;
	}
	
	// Darken version
	for (let i = 0; i < 15; i++) {
		darkVersion = darken(...darkVersion, 0.12);
		if (getContrastRatio(...darkVersion, ...EFFECTIVE_BG) >= minContrast) break;
	}
	
	const lightContrast = getContrastRatio(...lightVersion, ...EFFECTIVE_BG);
	const darkContrast = getContrastRatio(...darkVersion, ...EFFECTIVE_BG);
	
	// If we have a preference, use it if it meets contrast
	if (preferLight && lightContrast >= minContrast) {
		return lightVersion;
	}
	if (!preferLight && darkContrast >= minContrast) {
		return darkVersion;
	}
	
	// Otherwise pick whichever has better contrast
	return lightContrast > darkContrast ? lightVersion : darkVersion;
}

// Find the most vibrant colors from sampled pixels
function findVibrantColors(colors: Array<[number, number, number]>): {
	vibrant: [number, number, number];
	lightVibrant: [number, number, number];
	darkVibrant: [number, number, number];
	dominant: [number, number, number];
} {
	if (colors.length === 0) {
		return {
			vibrant: [120, 180, 80],
			lightVibrant: [160, 210, 120],
			darkVibrant: [80, 130, 50],
			dominant: [128, 128, 128]
		};
	}

	// Sort by saturation to find vibrant
	const bySaturation = [...colors].sort((a, b) => 
		getSaturation(...b) - getSaturation(...a)
	);
	
	// Get top saturated colors
	const topSaturated = bySaturation.slice(0, Math.max(20, Math.floor(colors.length * 0.15)));
	
	// Find vibrant with good luminance (not too dark, not too light)
	let vibrant = topSaturated[0];
	for (const color of topSaturated) {
		const lum = getLuminance(...color);
		const sat = getSaturation(...color);
		if (lum > 0.2 && lum < 0.8 && sat > 0.25) {
			vibrant = color;
			break;
		}
	}
	
	// Find a light vibrant (high luminance, decent saturation)
	let lightVibrant: [number, number, number] = lighten(...vibrant, 0.4);
	for (const color of topSaturated) {
		const lum = getLuminance(...color);
		const sat = getSaturation(...color);
		if (lum > 0.5 && sat > 0.2) {
			lightVibrant = color;
			break;
		}
	}
	
	// Find a dark vibrant (low luminance, decent saturation)
	let darkVibrant: [number, number, number] = darken(...vibrant, 0.4);
	for (const color of topSaturated) {
		const lum = getLuminance(...color);
		const sat = getSaturation(...color);
		if (lum < 0.4 && lum > 0.1 && sat > 0.2) {
			darkVibrant = color;
			break;
		}
	}

	// Calculate dominant color via averaging
	let avgR = 0, avgG = 0, avgB = 0;
	for (const [r, g, b] of colors) {
		avgR += r;
		avgG += g;
		avgB += b;
	}
	const dominant: [number, number, number] = [
		Math.floor(avgR / colors.length),
		Math.floor(avgG / colors.length),
		Math.floor(avgB / colors.length)
	];

	return { vibrant, lightVibrant, darkVibrant, dominant };
}

// Get dominant colors from image using canvas
export async function extractColors(imageUrl: string): Promise<ColorPalette> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		
		// Use wsrv.nl as a CORS proxy
		const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=100&h=100`;
		
		img.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				
				if (!ctx) {
					resolve(defaultColors);
					return;
				}

				const size = 50;
				canvas.width = size;
				canvas.height = size;
				
				ctx.drawImage(img, 0, 0, size, size);
				
				let imageData;
				try {
					imageData = ctx.getImageData(0, 0, size, size).data;
				} catch {
					console.log('CORS blocked color extraction, using defaults');
					resolve(defaultColors);
					return;
				}

				// Collect color samples
				const colors: Array<[number, number, number]> = [];
				for (let i = 0; i < imageData.length; i += 4) {
					const r = imageData[i];
					const g = imageData[i + 1];
					const b = imageData[i + 2];
					const lum = getLuminance(r, g, b);
					if (lum > 0.03 && lum < 0.97) {
						colors.push([r, g, b]);
					}
				}

				if (colors.length === 0) {
					resolve(defaultColors);
					return;
				}

				const { vibrant, lightVibrant, darkVibrant, dominant } = findVibrantColors(colors);
				const dominantLum = getLuminance(...dominant);
				const isLight = dominantLum > 0.5;
				
				// ===== HEADLINE COLOR =====
				// Start with the vibrant color, boost saturation
				let headline = saturate(...vibrant, 0.6);
				// Ensure it has good contrast - prefer LIGHTER for visibility
				headline = ensureContrastOnGray(headline, 3.5, true);
				
				// If still too dark, force lighten
				const headlineLum = getLuminance(...headline);
				if (headlineLum < 0.35) {
					headline = lighten(...headline, 0.4);
					headline = saturate(...headline, 0.3);
				}
				
				// ===== BODY TEXT COLOR =====
				// Body text must be highly readable - use dark text on the gray bg
				// Dark text has better contrast on the medium-gray background
				const textColor: [number, number, number] = [35, 35, 35]; // Near black
				
				// ===== HEADLINE SHADOW & ACCENT =====
				const headlineShadow = darken(...headline, 0.55);
				const headlineAccent = lighten(...headline, 0.35);
				
				// ===== TAG COLOR =====
				// Tags should use the same vibrant color family as headlines
				// Use headline color for tags so they match the theme
				const tagColor = headline;
				const tagTextColor: [number, number, number] = [35, 35, 35]; // Dark for readability
				
				// ===== LINK COLOR =====
				// Links need to be clearly visible - use a saturated, contrasting color
				let linkColor = saturate(...darkVibrant, 0.5);
				linkColor = ensureContrastOnGray(linkColor, 4.5, false); // Prefer darker for links
				
				// If link is too similar to text, make it more vibrant
				const linkLum = getLuminance(...linkColor);
				if (linkLum < 0.2) {
					linkColor = lighten(...linkColor, 0.3);
					linkColor = saturate(...linkColor, 0.4);
				}
				
				// ===== BORDER COLOR =====
				const borderColor = headline;

				const palette: ColorPalette = {
					bgColor: rgbToHex(...darken(...dominant, 0.4)),
					textColor: rgbToHex(...textColor),
					headlineColor: rgbToHex(...headline),
					headlineShadow: rgbToHex(...headlineShadow),
					headlineAccent: rgbToHex(...headlineAccent),
					tagColor: rgbToHex(...tagColor),
					tagTextColor: rgbToHex(...tagTextColor),
					borderColor: rgbToHex(...borderColor),
					linkColor: rgbToHex(...linkColor),
					isLight
				};

				resolve(palette);
			} catch {
				resolve(defaultColors);
			}
		};

		img.onerror = () => {
			resolve(defaultColors);
		};

		img.src = proxyUrl;
	});
}
