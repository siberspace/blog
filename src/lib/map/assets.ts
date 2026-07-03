/**
 * Drop-in asset paths for commissioned pixel art.
 * Set a string path to use a raster image; leave null for built-in SVG art.
 *
 * Examples:
 *   mapBackgroundSrc = '/map/background.png'
 *   landmarkImageSrc.printpress = '/map/landmarks/printpress.png'
 */
export const mapBackgroundSrc: string | null = null;

export const landmarkImageSrc: Record<string, string | null> = {
	printpress: null
};
