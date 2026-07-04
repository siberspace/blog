/**
 * Hotspot rectangles as % of background.png natural size (571×1024).
 *
 * Layout (iris falls flora art):
 *   Print press — bottom-left wooden shop with papers (~35%, 72%)
 *   Observatory — lower-right island, dome + telescope (~70%, 65%)
 *   Treehouses / oil rig / sphere / salamander — decorative only
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
	// Bottom-left shop only — below the sphere/salamander
	printpress: { left: 22, top: 66, width: 26, height: 14 },
	// Domed tower on the small island right of the central treehouses
	observatory: { left: 60, top: 56, width: 20, height: 16 }
};
