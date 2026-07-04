/**
 * Map artwork and debug flags.
 *
 * background.png natural size: 571×1024.
 * Set PUBLIC_MAP_DEBUG_HOTSPOTS=true or visit /?hotspots=1 to outline click regions.
 */
export const mapBackgroundSrc = '/map/background.png';

/** Intrinsic pixel size of background.png — single source of truth for aspect ratio. */
export const MAP_NATURAL = { w: 571, h: 1024 } as const;

export const landmarkImageSrc: Record<string, string | null> = {
	printpress: null,
	observatory: null,
	'reality-enjoyer': null,
	'saudi-oil': null
};

/** Dev-only hotspot outlines. Off unless env or ?hotspots=1. */
export const debugHotspotsEnv = import.meta.env.PUBLIC_MAP_DEBUG_HOTSPOTS === 'true';
