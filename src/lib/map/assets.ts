/**
 * Map artwork and debug flags.
 *
 * background.mp4 natural size: 720×1280 (looping, muted).
 * Set PUBLIC_MAP_DEBUG_HOTSPOTS=true or visit /?hotspots=1 to outline click regions.
 */
export const mapBackgroundSrc = '/map/background.mp4';

/** Intrinsic pixel size of the map art — single source of truth for aspect ratio. */
export const MAP_NATURAL = { w: 720, h: 1280 } as const;

export const landmarkImageSrc: Record<string, string | null> = {
	printpress: null,
	observatory: null,
	'reality-enjoyer': null,
	'saudi-oil': null
};

/** Dev-only hotspot outlines. Off unless env or ?hotspots=1. */
export const debugHotspotsEnv = import.meta.env.PUBLIC_MAP_DEBUG_HOTSPOTS === 'true';
