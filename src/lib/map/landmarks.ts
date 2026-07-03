export type Landmark = {
	id: string;
	label: string;
	icon: string;
	/** Horizontal position as % of map width (0–100) */
	x: number;
	/** Vertical position as % of map height (0–100) */
	y: number;
	href: string;
};

/**
 * Config-driven landmarks for the overworld map.
 * Add entries here (and an icon if needed) without touching layout code.
 */
export const landmarks: Landmark[] = [
	{
		id: 'printpress',
		label: 'Printing Press',
		icon: 'printpress',
		x: 42,
		y: 58,
		href: '/printpress'
	}
];
