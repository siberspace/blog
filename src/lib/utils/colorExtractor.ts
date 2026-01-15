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
	textColor: '#f0f0f0',
	headlineColor: '#7bc043',
	headlineShadow: '#1e3d1a',
	headlineAccent: '#5bbcd4',
	tagColor: '#4a5a48',
	tagTextColor: '#f0f0f0',
	borderColor: '#7bc043',
	linkColor: '#7bc043',
	isLight: false
};

// The actual background is always a grayish tone due to the texture overlay
// This is the effective background we're reading text against
const EFFECTIVE_BG_LIGHT = [180, 175, 170]; // Light gray from texture
const EFFECTIVE_BG_DARK = [90, 85, 80]; // Darker gray from texture

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

// Ensure a color meets minimum contrast against the background
function ensureContrast(
	color: [number, number, number], 
	bgColor: [number, number, number], 
	minContrast: number
): [number, number, number] {
	let [r, g, b] = color;
	const bgLum = getLuminance(...bgColor);
	let contrast = getContrastRatio(r, g, b, ...bgColor);
	
	// If contrast is too low, push towards white or black
	let iterations = 0;
	while (contrast < minContrast && iterations < 20) {
		if (bgLum > 0.5) {
			// Dark background color, make text darker
			[r, g, b] = darken(r, g, b, 0.15);
		} else {
			// Light background color, make text lighter
			[r, g, b] = lighten(r, g, b, 0.15);
		}
		contrast = getContrastRatio(r, g, b, ...bgColor);
		iterations++;
	}
	
	return [r, g, b];
}

// Find the most vibrant colors from sampled pixels
function findVibrantColors(colors: Array<[number, number, number]>): {
	vibrant: [number, number, number];
	muted: [number, number, number];
	dominant: [number, number, number];
} {
	if (colors.length === 0) {
		return {
			vibrant: [120, 180, 80],
			muted: [100, 100, 100],
			dominant: [128, 128, 128]
		};
	}

	// Sort by saturation to find vibrant
	const bySaturation = [...colors].sort((a, b) => 
		getSaturation(...b) - getSaturation(...a)
	);
	
	// Get most saturated colors and pick one with good luminance
	const vibrantCandidates = bySaturation.slice(0, Math.max(10, colors.length * 0.1));
	let vibrant = vibrantCandidates[0];
	
	// Prefer vibrant colors that aren't too dark or too light
	for (const color of vibrantCandidates) {
		const lum = getLuminance(...color);
		if (lum > 0.25 && lum < 0.75 && getSaturation(...color) > 0.3) {
			vibrant = color;
			break;
		}
	}

	// Calculate dominant color (most common-ish via averaging clusters)
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

	// Find a muted version (lower saturation)
	const byMuted = [...colors].sort((a, b) => 
		getSaturation(...a) - getSaturation(...b)
	);
	const muted = byMuted[Math.floor(byMuted.length * 0.3)] || dominant;

	return { vibrant, muted, dominant };
}

// Get dominant colors from image using canvas
export async function extractColors(imageUrl: string): Promise<ColorPalette> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		
		// Use wsrv.nl as a CORS proxy (free image CDN that adds CORS headers)
		const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=100&h=100`;
		
		img.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				
				if (!ctx) {
					resolve(defaultColors);
					return;
				}

				// Use a small size for faster processing
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

				// Collect color samples, excluding extreme values
				const colors: Array<[number, number, number]> = [];
				for (let i = 0; i < imageData.length; i += 4) {
					const r = imageData[i];
					const g = imageData[i + 1];
					const b = imageData[i + 2];
					const lum = getLuminance(r, g, b);
					// Include more colors but still skip pure black/white
					if (lum > 0.05 && lum < 0.95) {
						colors.push([r, g, b]);
					}
				}

				if (colors.length === 0) {
					resolve(defaultColors);
					return;
				}

				const { vibrant, muted, dominant } = findVibrantColors(colors);
				
				// The effective background is always the grayish texture
				// Use the dominant color's luminance to decide light vs dark adjustments
				const dominantLum = getLuminance(...dominant);
				const isLight = dominantLum > 0.5;
				
				// ===== HEADLINE COLOR =====
				// Boost the vibrant color's saturation and ensure good contrast
				let headline = saturate(...vibrant, 0.5);
				// Ensure headline pops against the gray background
				const headlineContrast = getContrastRatio(...headline, ...EFFECTIVE_BG_LIGHT);
				if (headlineContrast < 3) {
					// Not enough contrast, darken or saturate more
					headline = darken(...headline, 0.2);
				}
				
				// ===== BODY TEXT COLOR =====
				// Body text MUST be highly readable - use near-white or near-black
				// The background is always a medium gray, so we need strong contrast
				let textColor: [number, number, number];
				
				// Always use very light text (off-white) for best readability on gray background
				// The texture creates a medium-gray effective background
				textColor = [240, 238, 235]; // Warm off-white
				
				// Verify contrast and adjust if needed
				const textContrast = getContrastRatio(...textColor, ...EFFECTIVE_BG_LIGHT);
				if (textContrast < 4.5) {
					// Shouldn't happen with off-white on gray, but fallback
					textColor = [255, 255, 255];
				}
				
				// ===== HEADLINE SHADOW & ACCENT =====
				const headlineShadow = darken(...headline, 0.6);
				const headlineAccent = lighten(...headline, 0.4);
				
				// ===== TAG COLORS =====
				// Tags need to be readable - use muted color with good contrast text
				const tagBg = darken(...muted, 0.3);
				const tagText = ensureContrast([230, 230, 230], tagBg, 4.5);
				
				// ===== LINK COLOR =====
				// Links should be visible - use a lighter version of headline
				let linkColor = lighten(...headline, 0.2);
				linkColor = ensureContrast(linkColor, EFFECTIVE_BG_LIGHT, 4.5);
				
				// ===== BORDER COLOR =====
				// Use the vibrant color for borders (decorative, doesn't need high contrast)
				const borderColor = headline;

				const palette: ColorPalette = {
					bgColor: rgbToHex(...darken(...dominant, 0.4)),
					textColor: rgbToHex(...textColor),
					headlineColor: rgbToHex(...headline),
					headlineShadow: rgbToHex(...headlineShadow),
					headlineAccent: rgbToHex(...headlineAccent),
					tagColor: rgbToHex(...tagBg),
					tagTextColor: rgbToHex(...tagText),
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
