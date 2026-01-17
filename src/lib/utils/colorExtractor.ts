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
	imageCardBg: string;
	isLight: boolean;
}

// Default green theme - vibrant and colorful
export const defaultColors: ColorPalette = {
	bgColor: '#2a4528',
	textColor: '#1a1a1a',
	headlineColor: '#2e8b57', // Sea green - vibrant but readable
	headlineShadow: '#1a5035',
	headlineAccent: '#5cb882',
	tagColor: '#2e8b57',
	tagTextColor: '#1a1a1a',
	borderColor: '#2e8b57',
	linkColor: '#228b53',
	imageCardBg: 'rgba(46, 139, 87, 0.15)',
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

// Get hue of a color (0-360)
function getHue(r: number, g: number, b: number): number {
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	
	if (delta === 0) return 0;
	
	let hue = 0;
	if (max === r) {
		hue = ((g - b) / delta) % 6;
	} else if (max === g) {
		hue = (b - r) / delta + 2;
	} else {
		hue = (r - g) / delta + 4;
	}
	
	hue *= 60;
	if (hue < 0) hue += 360;
	return hue;
}

// Check if a color is "muddy" (brown, gray, beige, skin tone)
// These colors have low saturation OR are in the brown/orange hue range with low saturation
function isColorMuddy(r: number, g: number, b: number): boolean {
	const sat = getSaturation(r, g, b);
	const lum = getLuminance(r, g, b);
	const hue = getHue(r, g, b);
	
	// Very low saturation = gray
	if (sat < 0.25) return true;
	
	// Brown/beige/skin tones: orange-ish hue (15-45) with medium-low saturation
	if (hue >= 15 && hue <= 50 && sat < 0.5) return true;
	
	// Desaturated warm tones
	if (hue >= 0 && hue <= 60 && sat < 0.4 && lum > 0.2 && lum < 0.7) return true;
	
	return false;
}

// Calculate a "vibrancy score" - higher is more colorful and interesting
function getVibrancyScore(r: number, g: number, b: number): number {
	const sat = getSaturation(r, g, b);
	const lum = getLuminance(r, g, b);
	const hue = getHue(r, g, b);
	
	// Base score from saturation
	let score = sat * 100;
	
	// Penalize very dark or very light colors
	if (lum < 0.15 || lum > 0.85) score *= 0.3;
	else if (lum < 0.25 || lum > 0.75) score *= 0.7;
	
	// STRONGLY boost cool colors (cyan, teal, green, blue, purple)
	// Cyan/Teal: 160-200 - these are the "hero" colors we want
	if (hue >= 160 && hue <= 200) {
		score *= 2.5;
	}
	// Green: 80-160
	else if (hue >= 80 && hue < 160) {
		score *= 2.0;
	}
	// Blue/Purple: 200-300
	else if (hue > 200 && hue <= 300) {
		score *= 1.8;
	}
	
	// HEAVILY penalize red/orange/warm colors - these are often distractions
	// Red: 0-20 and 340-360
	if (hue <= 20 || hue >= 340) {
		score *= 0.15; // Heavy penalty for reds
	}
	// Orange/brown: 20-50
	else if (hue > 20 && hue <= 50) {
		score *= 0.2; // Heavy penalty for oranges
	}
	// Warm yellow-ish: 50-80
	else if (hue > 50 && hue < 80) {
		score *= 0.5;
	}
	
	return score;
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
	const fallbackGreen: [number, number, number] = [80, 180, 100];
	
	if (colors.length === 0) {
		return {
			vibrant: fallbackGreen,
			lightVibrant: [140, 220, 160],
			darkVibrant: [50, 130, 70],
			dominant: [128, 128, 128]
		};
	}

	// Filter out muddy colors first
	const colorfulColors = colors.filter(([r, g, b]) => !isColorMuddy(r, g, b));
	
	// If we filtered too aggressively, use colors with decent saturation
	const workingColors = colorfulColors.length >= 10 
		? colorfulColors 
		: colors.filter(([r, g, b]) => getSaturation(r, g, b) > 0.2);
	
	// Sort by vibrancy score (not just saturation)
	const byVibrancy = [...(workingColors.length > 0 ? workingColors : colors)].sort((a, b) => 
		getVibrancyScore(...b) - getVibrancyScore(...a)
	);
	
	// Get top vibrant colors
	const topVibrant = byVibrancy.slice(0, Math.max(15, Math.floor(byVibrancy.length * 0.1)));
	
	// Find the best vibrant color
	let vibrant = topVibrant[0] || fallbackGreen;
	for (const color of topVibrant) {
		const lum = getLuminance(...color);
		const sat = getSaturation(...color);
		const score = getVibrancyScore(...color);
		// Pick the first color with good luminance, saturation, and score
		if (lum > 0.25 && lum < 0.75 && sat > 0.35 && score > 30) {
			vibrant = color;
			break;
		}
	}
	
	// Find a light vibrant (high luminance, decent saturation)
	let lightVibrant: [number, number, number] = lighten(...vibrant, 0.4);
	for (const color of topVibrant) {
		const lum = getLuminance(...color);
		const sat = getSaturation(...color);
		if (lum > 0.5 && sat > 0.3 && !isColorMuddy(...color)) {
			lightVibrant = color;
			break;
		}
	}
	
	// Find a dark vibrant (low luminance, decent saturation)
	let darkVibrant: [number, number, number] = darken(...vibrant, 0.3);
	for (const color of topVibrant) {
		const lum = getLuminance(...color);
		const sat = getSaturation(...color);
		if (lum < 0.45 && lum > 0.15 && sat > 0.3 && !isColorMuddy(...color)) {
			darkVibrant = color;
			break;
		}
	}

	// Calculate dominant color via averaging (of all colors, for bg purposes)
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

				const size = 64;
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

				// Sample colors from the CENTER of the image where the subject typically is
				// Focus on the middle 30% of the image (tight center crop)
				const centerStart = Math.floor(size * 0.35);
				const centerEnd = Math.floor(size * 0.65);
				
				const colors: Array<[number, number, number]> = [];
				for (let y = centerStart; y < centerEnd; y++) {
					for (let x = centerStart; x < centerEnd; x++) {
						const i = (y * size + x) * 4;
						const r = imageData[i];
						const g = imageData[i + 1];
						const b = imageData[i + 2];
						const lum = getLuminance(r, g, b);
						// Skip very dark and very light pixels
						if (lum > 0.05 && lum < 0.95) {
							colors.push([r, g, b]);
						}
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
				// Start with the vibrant color, boost saturation significantly
				let headline = saturate(...vibrant, 1.2);
				// Only slightly darken to maintain vibrancy, prefer lightening for contrast
				headline = darken(...headline, 0.1);
				headline = saturate(...headline, 0.6); // Re-saturate to stay punchy
				// Ensure minimum contrast - PREFER LIGHTER for more vibrant feel
				headline = ensureContrastOnGray(headline, 4.0, true);
				
				// ===== BODY TEXT COLOR =====
				// Body text must be highly readable - use dark text on the gray bg
				const textColor: [number, number, number] = [35, 35, 35]; // Near black
				
				// ===== HEADLINE SHADOW & ACCENT =====
				// Shadow should be much darker for 3D depth
				const headlineShadow = darken(...headline, 0.6);
				// Accent (highlight edge) should be much brighter for embossed effect
				const headlineAccent = lighten(...headline, 0.6);
				
				// ===== TAG COLOR =====
				// Tags should be colorful and punchy - use the vibrant with heavy saturation
				let tagColor = saturate(...vibrant, 1.5); // Heavy saturation boost
				// Prefer lighter, more vibrant version for tags
				tagColor = ensureContrastOnGray(tagColor, 4.0, true);
				const tagTextColor: [number, number, number] = [35, 35, 35];
				
				// ===== LINK COLOR =====
				// Links should be colorful too
				let linkColor = saturate(...darkVibrant, 1.2);
				linkColor = ensureContrastOnGray(linkColor, 4.5, true); // Prefer light for vibrancy
				
				// ===== BORDER COLOR =====
				const borderColor = tagColor;
				
				// ===== IMAGE CARD BACKGROUND =====
				// Use the headline color at low opacity for subtle, cohesive card backgrounds
				const imageCardBg = `rgba(${headline[0]}, ${headline[1]}, ${headline[2]}, 0.15)`;

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
					imageCardBg,
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
