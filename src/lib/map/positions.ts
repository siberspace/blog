/**
 * Landmark hotspot centers as % of /map/background.png (0–100).
 *
 * Salamander sits ~ (25%, 40%) in the water — do not place hotspots there.
 * Print press island is left-center land, right of the salamander.
 * Observatory is right-center (dome + telescope).
 * Town is center (decorative only).
 */
export const LANDMARK_HOTSPOTS = {
	printpress: { x: 36, y: 50 },
	observatory: { x: 78, y: 55 }
} as const;
