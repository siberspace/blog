/**
 * Hotspot rectangles as % of background.png natural size (571×1024).
 *
 * Layout (new flora art):
 *   Print press — lower-left island (wooden shop, papers, trees) ~35%, 75%
 *   Observatory — lower-right island (dome + telescope) ~70%, 65%
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
	// Lower-left island: rustic press building with papers
	printpress: { left: 20, top: 66, width: 30, height: 18 },
	// Lower-right island: domed tower + telescope (not the central treehouses)
	observatory: { left: 58, top: 54, width: 24, height: 20 }
};
