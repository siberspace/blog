import { LANDMARK_HOTSPOTS } from './positions';

export type Landmark = {
	id: string;
	label: string;
	icon: string;
	/** Horizontal position as % of map width (0–100) — center of hotspot */
	x: number;
	/** Vertical position as % of map height (0–100) — center of hotspot */
	y: number;
	href: string;
};

/**
 * Config-driven landmarks for the overworld map.
 * Positions match /map/background.png; add entries without touching layout code.
 */
export const landmarks: Landmark[] = [
	{
		id: 'printpress',
		label: 'Printing Press',
		icon: 'printpress',
		x: LANDMARK_HOTSPOTS.printpress.x,
		y: LANDMARK_HOTSPOTS.printpress.y,
		href: '/printpress'
	},
	{
		id: 'observatory',
		label: 'Observatory',
		icon: 'observatory',
		x: LANDMARK_HOTSPOTS.observatory.x,
		y: LANDMARK_HOTSPOTS.observatory.y,
		href: '/observatory'
	}
];
