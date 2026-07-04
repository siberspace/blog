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
		id: 'reality-enjoyer',
		label: 'reality enjoyer',
		icon: 'reality-enjoyer',
		href: '/reality-enjoyer',
		...LANDMARK_HOTSPOTS['reality-enjoyer']
	},
	{
		id: 'times',
		label: 'iris falls times',
		icon: 'printpress',
		href: '/printpress',
		...LANDMARK_HOTSPOTS.times
	},
	{
		id: 'observatory',
		label: 'iris falls observatory',
		icon: 'observatory',
		href: '/observatory',
		...LANDMARK_HOTSPOTS.observatory
	},
	{
		id: 'saudi-oil',
		label: 'saudi oil',
		icon: 'saudi-oil',
		href: '/saudi-oil',
		...LANDMARK_HOTSPOTS['saudi-oil']
	}
];
