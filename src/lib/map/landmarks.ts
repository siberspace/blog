import { LANDMARK_HOTSPOTS, type HotspotRect } from './positions';

export type Landmark = {
	id: string;
	label: string;
	icon: string;
	href: string;
} & HotspotRect;

/**
 * Config-driven landmarks. Rects are % of the background image box.
 * Add entries here without touching layout code.
 */
export const landmarks: Landmark[] = [
	{
		id: 'printpress',
		label: 'Printing Press',
		icon: 'printpress',
		href: '/printpress',
		...LANDMARK_HOTSPOTS.printpress
	},
	{
		id: 'observatory',
		label: 'Observatory',
		icon: 'observatory',
		href: '/observatory',
		...LANDMARK_HOTSPOTS.observatory
	}
];
