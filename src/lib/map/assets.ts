/**
 * Drop-in asset paths for commissioned pixel art (hard edges, no anti-aliasing).
 * Set a string path to use a raster image; leave null for built-in pixel buffers.
 *
 * The reference archipelago art lives at /map/background.png.
 * Swap landmark sprites via landmarkImageSrc when individual PNGs are ready.
 */
export const mapBackgroundSrc: string | null = '/map/background.png';

/** Intrinsic size of background.png — drives frame aspect ratio. */
export const mapBackgroundSize = { w: 928, h: 1152 } as const;

export const landmarkImageSrc: Record<string, string | null> = {
	printpress: null,
	observatory: null
};
