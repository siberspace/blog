/**
 * Hotspot rectangles as % of background.png natural size (571×1024).
 *
 * Centers from the current flora art:
 *   reality enjoyer (silver sphere) ~20%, 37%
 *   iris falls times (newspaper stand) ~35%, 73%
 *   iris falls observatory (telescope tower) ~69%, 65%
 *   saudi oil (oil rig) ~80%, 85%
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

export const LANDMARK_HOTSPOTS: Record<string, HotspotRect> = {
	// Upper-left silver sphere
	'reality-enjoyer': { left: 8, top: 28, width: 24, height: 18 },
	// Lower-left newspaper stand (DAILY IBIS)
	times: { left: 22, top: 66, width: 26, height: 14 },
	// Lower-middle-right dome + telescope tower
	observatory: { left: 58, top: 56, width: 22, height: 16 },
	// Bottom-right glowing oil rig
	'saudi-oil': { left: 68, top: 76, width: 24, height: 16 }
};
