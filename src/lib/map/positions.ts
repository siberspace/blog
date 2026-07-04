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
 * Pixel boxes from background.png (928×1152), then padded:
 *   print press — porch light ~(223,749); building ~x 150–360, y 640–820
 *   observatory — dome/telescope tower only (not central gabled houses);
 *     window cluster ~(720–780, 420–446), tower sits further right than town
 */
export const LANDMARK_HOTSPOTS: Record<string, HotspotRect> = {
	// Industrial island: chimney, lit awning, twin tanks (lower-left of art)
	printpress: { left: 15, top: 54, width: 26, height: 20 },
	// Round dome + telescope tower (right of the central town cluster)
	observatory: { left: 74, top: 28, width: 14, height: 18 }
};
