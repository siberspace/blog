/**
 * Landmark hotspot centers as % of /map/background.png (0–100).
 *
 * Salamander sits ~ (25%, 40%) in the water — do not place hotspots there.
 * Print press island is left-center land, right of the salamander.
 * Observatory is right-center (dome + telescope).
 * Town is center (decorative only).
 */
export const LANDMARK_HOTSPOTS = {
	/** Bottom-center island: chimney, awning light, twin tanks */
	printpress: { x: 50, y: 75 },
	observatory: { x: 78, y: 55 }
} as const;
