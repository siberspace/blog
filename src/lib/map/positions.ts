/**
 * Hotspot rectangles as % of background.png natural size (928×1152).
 *
 * Measured from lit windows / building footprints in the source art, then
 * padded ~3% of each axis so targets stay easy to click/tap.
 *
 * Do NOT place printpress near the salamander (~24%, 40%).
 */
export type HotspotRect = {
	/** left edge, % of image width */
	left: number;
	/** top edge, % of image height */
	top: number;
	/** width, % of image width */
	width: number;
	/** height, % of image height */
	height: number;
};

/**
 * Pixel boxes (before padding), from background.png:
 *   print press porch light ~(223,749); building mass ~x 150–360, y 640–820
 *   observatory windows ~(720–780, 420–445); dome/tower ~x 650–830, y 300–520
 */
export const LANDMARK_HOTSPOTS: Record<string, HotspotRect> = {
	// Industrial island: chimney, lit awning, twin tanks (lower-left of art)
	printpress: { left: 15, top: 54, width: 26, height: 20 },
	// Dome + telescope tower (upper-right of main cluster)
	observatory: { left: 68, top: 25, width: 20, height: 20 }
};
