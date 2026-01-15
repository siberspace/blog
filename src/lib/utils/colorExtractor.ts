// Client-side color extraction using canvas
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
	textColor: '#c8d8c6',
	headlineColor: '#7bc043',
	headlineShadow: '#1e3d1a',
	headlineAccent: '#5bbcd4',
	tagColor: '#4a5a48',
	tagTextColor: '#c8d8c6',
	borderColor: '#385c35',
	linkColor: '#7bc043',
	isLight: false
};

// Helper to determine if a color is light or dark
function getLuminance(r: number, g: number, b: number): number {
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Get dominant colors from image using canvas
export async function extractColors(imageUrl: string): Promise<ColorPalette> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		
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
				const imageData = ctx.getImageData(0, 0, size, size).data;

				// Collect color samples
				const colors: Array<[number, number, number]> = [];
				for (let i = 0; i < imageData.length; i += 4) {
					const r = imageData[i];
					const g = imageData[i + 1];
					const b = imageData[i + 2];
					// Skip very dark or very light pixels
					const lum = getLuminance(r, g, b);
					if (lum > 0.1 && lum < 0.9) {
						colors.push([r, g, b]);
					}
				}

				if (colors.length === 0) {
					resolve(defaultColors);
					return;
				}

				// Find the most vibrant color (highest saturation)
				let vibrant: [number, number, number] = colors[0];
				let maxSaturation = 0;
				
				for (const [r, g, b] of colors) {
					const max = Math.max(r, g, b);
					const min = Math.min(r, g, b);
					const saturation = max === 0 ? 0 : (max - min) / max;
					if (saturation > maxSaturation) {
						maxSaturation = saturation;
						vibrant = [r, g, b];
					}
				}

				// Calculate average color for muted tones
				let avgR = 0, avgG = 0, avgB = 0;
				for (const [r, g, b] of colors) {
					avgR += r;
					avgG += g;
					avgB += b;
				}
				avgR = Math.floor(avgR / colors.length);
				avgG = Math.floor(avgG / colors.length);
				avgB = Math.floor(avgB / colors.length);

				// Determine if light or dark theme based on average luminance
				const avgLuminance = getLuminance(avgR, avgG, avgB);
				const isLight = avgLuminance > 0.5;

				// Generate color palette
				const darkVibrant = darken(...vibrant, 0.4);
				const lightVibrant = lighten(...vibrant, 0.3);
				const muted: [number, number, number] = [avgR, avgG, avgB];
				const darkMuted = darken(avgR, avgG, avgB, 0.5);
				const lightMuted = lighten(avgR, avgG, avgB, 0.4);

				const palette: ColorPalette = {
					bgColor: isLight ? rgbToHex(...lighten(...lightMuted, 0.3)) : rgbToHex(...darken(...darkMuted, 0.3)),
					textColor: isLight ? rgbToHex(...darken(...darkVibrant, 0.2)) : rgbToHex(...lighten(...lightMuted, 0.2)),
					headlineColor: rgbToHex(...vibrant),
					headlineShadow: rgbToHex(...darkVibrant),
					headlineAccent: rgbToHex(...lightVibrant),
					tagColor: isLight ? rgbToHex(...darken(...muted, 0.1)) : rgbToHex(...lighten(...muted, 0.1)),
					tagTextColor: isLight ? rgbToHex(...darkVibrant) : rgbToHex(...lightMuted),
					borderColor: rgbToHex(...vibrant),
					linkColor: isLight ? rgbToHex(...darkVibrant) : rgbToHex(...lightVibrant),
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

		img.src = imageUrl;
	});
}

