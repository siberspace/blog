/**
 * Color extraction utilities for dynamic theming
 */

export type ColorPalette = {
	headlineColor: string;
	headlineShadow: string;
	headlineAccent: string;
	tagColor: string;
	imageCardBg: string;
};

// Default colors for when no image is available or during SSR
export const defaultColors: ColorPalette = {
	headlineColor: '#c8c8d0',
	headlineShadow: 'rgba(0, 0, 0, 0.8)',
	headlineAccent: 'rgba(255, 255, 255, 0.3)',
	tagColor: '#c8c8d0',
	imageCardBg: 'rgba(255, 255, 255, 0.08)',
};

/**
 * Extract dominant colors from an image URL
 * Returns a color palette for dynamic theming
 */
export async function extractColors(imageUrl: string): Promise<ColorPalette> {
	// Only run in browser
	if (typeof window === 'undefined') {
		return defaultColors;
	}

	try {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = imageUrl;
		});

		// Create canvas and draw image
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return defaultColors;

		// Use smaller size for faster processing
		const maxSize = 50;
		const scale = Math.min(maxSize / img.width, maxSize / img.height);
		canvas.width = img.width * scale;
		canvas.height = img.height * scale;

		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		// Get image data
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const pixels = imageData.data;

		// Simple color extraction - get average and vibrant colors
		let totalR = 0, totalG = 0, totalB = 0;
		let maxSaturation = 0;
		let vibrantR = 128, vibrantG = 128, vibrantB = 128;
		let pixelCount = 0;

		for (let i = 0; i < pixels.length; i += 4) {
			const r = pixels[i];
			const g = pixels[i + 1];
			const b = pixels[i + 2];
			const a = pixels[i + 3];

			// Skip transparent pixels
			if (a < 128) continue;

			totalR += r;
			totalG += g;
			totalB += b;
			pixelCount++;

			// Calculate saturation to find vibrant color
			const max = Math.max(r, g, b);
			const min = Math.min(r, g, b);
			const saturation = max === 0 ? 0 : (max - min) / max;
			const lightness = (max + min) / 2;

			// Prefer saturated colors that aren't too dark or light
			if (saturation > maxSaturation && lightness > 50 && lightness < 200) {
				maxSaturation = saturation;
				vibrantR = r;
				vibrantG = g;
				vibrantB = b;
			}
		}

		if (pixelCount === 0) return defaultColors;

		// Calculate average color
		const avgR = Math.round(totalR / pixelCount);
		const avgG = Math.round(totalG / pixelCount);
		const avgB = Math.round(totalB / pixelCount);

		// Use vibrant color if found, otherwise lighten the average
		const headlineR = maxSaturation > 0.2 ? vibrantR : Math.min(255, avgR + 60);
		const headlineG = maxSaturation > 0.2 ? vibrantG : Math.min(255, avgG + 60);
		const headlineB = maxSaturation > 0.2 ? vibrantB : Math.min(255, avgB + 60);

		// Create palette
		const headlineColor = `rgb(${headlineR}, ${headlineG}, ${headlineB})`;
		const headlineShadow = `rgba(${Math.max(0, avgR - 80)}, ${Math.max(0, avgG - 80)}, ${Math.max(0, avgB - 80)}, 0.8)`;
		const headlineAccent = `rgba(${headlineR}, ${headlineG}, ${headlineB}, 0.3)`;
		const tagColor = `rgb(${Math.min(255, headlineR + 20)}, ${Math.min(255, headlineG + 20)}, ${Math.min(255, headlineB + 20)})`;
		const imageCardBg = `rgba(${avgR}, ${avgG}, ${avgB}, 0.15)`;

		return {
			headlineColor,
			headlineShadow,
			headlineAccent,
			tagColor,
			imageCardBg,
		};
	} catch (error) {
		console.warn('Failed to extract colors:', error);
		return defaultColors;
	}
}
