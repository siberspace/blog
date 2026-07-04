/**
 * Map artwork and debug flags.
 *
 * background.png natural size: 928×1152 (flora.ai commission).
 * Set PUBLIC_MAP_DEBUG_HOTSPOTS=true or visit /?hotspots=1 to outline click regions.
 */
export const mapBackgroundSrc = '/map/background.png';

/** Intrinsic pixel size of background.png — single source of truth for aspect ratio. */
export const MAP_NATURAL = { w: 928, h: 1152 } as const;

export const landmarkImageSrc: Record<string, string | null> = {
	printpress: null,
	observatory: null
};

/** Dev-only hotspot outlines. Off unless env or ?hotspots=1. */
export const debugHotspotsEnv = import.meta.env.PUBLIC_MAP_DEBUG_HOTSPOTS === 'true';
